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
class WSSProvider extends EventEmitter {
    constructor() {
        super();
        this.initializeListener = async () => {
            console.log("  WSS PROVIDER SET, TESTING...".magenta);
            await this.validate();
        };
        this.failListener = async () => {
            console.log("  WSS PROVIDER TEST FAIL: RESETTING...");
            // Mailer.sendEmail("Listener Failure", "WSS PROVIDER TEST FAIL");
            this.provider._websocket.terminate();
        };
        this.initializeWebsocketProvider();
    }

    clearState() {
        this.provider = null;
        this.ready = false;
        this.removeListener(
            "initializeWebsocketProvider",
            this.initializeListener,
        );
        this.removeListener("fail", this.failListener);
    }

    async initializeWebsocketProvider() {
        this.clearState();
        const endpoints = Endpoint.getWssEndpoints();
        // pick random endpoint from list
        const endpoint =
            endpoints[Math.floor(Math.random() * endpoints.length)];
        this.provider = new ethers.providers.WebSocketProvider(
            endpoint,
            BLOCKCHAIN_NETWORK,
        );
        this.listen();
        console.log(
            colors.magenta("  WSS PROVIDER ACTIVE: %s".green),
            endpoint,
        );
        this.emit("initializeWebsocketProvider");
    }

    listen() {
        this.provider.once("error", async (error) => {
            // Mailer.sendEmail("Provider Error", error.stack);
            Sentry.captureException(error, {
                tags: {
                    listener: "provider error",
                },
            });
            this.provider._websocket.terminate();
        });
        this.provider._websocket.once("error", async (error) => {
            // Mailer.sendEmail("WebSocket Error", error.stack);
            Sentry.captureException(error, {
                tags: {
                    listener: "provider websocket error",
                },
            });
            this.provider._websocket.terminate();
        });
        this.provider._websocket.once("close", async () => {
            console.log("  WEBSOCKET EVENT: CLOSE: RESETTING...".yellow);
            await this.initializeWebsocketProvider();
        });
        this.once("initializeWebsocketProvider", this.initializeListener);
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
                console.log("  WSS PROVIDER TESTED\n".cyan);
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
                    listener: "provider test fail",
                },
            });
            this.emit("fail");
        }
    }
}

export default WSSProvider;
