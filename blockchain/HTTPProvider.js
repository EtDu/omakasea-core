import Endpoint from "./Endpoints.js";
import ethers from "ethers";
import { EventEmitter } from "events";
import colors from "colors";
import * as Sentry from "@sentry/node";

import { BLOCKCHAIN_NETWORK, SENTRY_URL } from "../../utils/constants.js";

const sentryENV =
    BLOCKCHAIN_NETWORK === "goerli" ? "development" : "production";

Sentry.init({
    dsn: SENTRY_URL,
    tracesSampleRate: 1.0,
    environment: sentryENV,
});

// import Mailer from "../../omakasea-core/util/Mailer.js";

// Create instances of this class to access
class HTTPProvider extends EventEmitter {
    constructor() {
        super();
        this.initializeListener = async () => {
            console.log("  HTTP PROVIDER SET, TESTING...".magenta);
            await this.validate();
        };
        this.failListener = async () => {
            console.log("  HTTP PROVIDER TEST FAIL: RESETTING...");
            // Mailer.sendEmail("Listener Failure", "WSS PROVIDER TEST FAIL");
            this.provider._websocket.terminate();
        };
        this.initializeHTTPProvider();
    }

    clearState() {
        this.provider = null;
        this.ready = false;
        this.removeListener("initializeHTTPProvider", this.initializeListener);
        this.removeListener("fail", this.failListener);
    }

    async initializeHTTPProvider() {
        this.clearState();
        const endpoints = Endpoint.getHttpsEndpoints();
        // pick random endpoint from list
        const endpoint =
            endpoints[Math.floor(Math.random() * endpoints.length)];
        this.provider = new ethers.providers.JsonRpcProvider(
            endpoint,
            BLOCKCHAIN_NETWORK,
        );
        this.listen();
        console.log(
            colors.magenta("  HTTP PROVIDER ACTIVE: %s".green),
            endpoint,
        );
        this.emit("initializeHTTPProvider");
    }

    listen() {
        this.provider.once("error", async (error) => {
            // Mailer.sendEmail("Provider Error", error.stack);
            Sentry.captureException(error, {
                tags: {
                    httpProvider: "provider error",
                },
            });
            await this.initializeHTTPProvider();
        });

        this.once("initializeHTTPProvider", this.initializeListener);
        this.once("fail", this.failListener);
    }

    async validate() {
        try {
            const request = await this.provider.send("eth_blockNumber");
            if (
                typeof request == "string" &&
                request.charAt(0) == "0" &&
                request.charAt(1) == "x"
            ) {
                console.log("  HTTP PROVIDER TESTED\n".cyan);
                this.ready = true;
                this.emit("pass");
            } else {
                Sentry.captureMessage(
                    `provider test fail, eth_blockNumber result: ${request}`,
                );
                this.emit("fail");
            }
        } catch (e) {
            console.log(e);
            Sentry.captureException(e, {
                tags: {
                    httpProvider: "provider test fail",
                },
            });
            this.emit("fail");
        }
    }
}

export default HTTPProvider;
