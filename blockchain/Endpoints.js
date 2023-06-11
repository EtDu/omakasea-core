import dotenv from "dotenv";
dotenv.config();

import {
    QUICKNODE_HTTPS_1,
    QUICKNODE_HTTPS_2,
    QUICKNODE_HTTPS_3,
    QUICKNODE_HTTPS_4,
    QUICKNODE_HTTPS_5,
    QUICKNODE_HTTPS_6,
    QUICKNODE_HTTPS_7,
    QUICKNODE_HTTPS_8,
    QUICKNODE_HTTPS_9,
    QUICKNODE_HTTPS_10,
    QUICKNODE_WSS_1,
    QUICKNODE_WSS_2,
    QUICKNODE_WSS_3,
    QUICKNODE_WSS_4,
    QUICKNODE_WSS_5,
    QUICKNODE_WSS_6,
    QUICKNODE_WSS_7,
    QUICKNODE_WSS_8,
    QUICKNODE_WSS_9,
    QUICKNODE_WSS_10,
} from "../../utils/constants.js";

class Endpoints {
    static getHttpsEndpoints() {
        const httpsEndpoints = [
            QUICKNODE_HTTPS_1,
            QUICKNODE_HTTPS_2,
            QUICKNODE_HTTPS_3,
            QUICKNODE_HTTPS_4,
            QUICKNODE_HTTPS_5,
            QUICKNODE_HTTPS_6,
            QUICKNODE_HTTPS_7,
            QUICKNODE_HTTPS_8,
            QUICKNODE_HTTPS_9,
            QUICKNODE_HTTPS_10,
            QUICKNODE_WSS_1,
            QUICKNODE_WSS_2,
            QUICKNODE_WSS_3,
            QUICKNODE_WSS_4,
            QUICKNODE_WSS_5,
            QUICKNODE_WSS_6,
            QUICKNODE_WSS_7,
            QUICKNODE_WSS_8,
            QUICKNODE_WSS_9,
            QUICKNODE_WSS_10,
        ];

        if (!QUICKNODE_HTTPS_1)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_1), 1);
        if (!QUICKNODE_HTTPS_2)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_2), 1);
        if (!QUICKNODE_HTTPS_3)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_3), 1);
        if (!QUICKNODE_HTTPS_4)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_4), 1);
        if (!QUICKNODE_HTTPS_5)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_5), 1);
        if (!QUICKNODE_HTTPS_6)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_6), 1);
        if (!QUICKNODE_HTTPS_7)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_7), 1);
        if (!QUICKNODE_HTTPS_8)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_8), 1);
        if (!QUICKNODE_HTTPS_9)
            httpsEndpoints.splice(httpsEndpoints.indexOf(QUICKNODE_HTTPS_9), 1);
        if (!QUICKNODE_HTTPS_10)
            httpsEndpoints.splice(
                httpsEndpoints.indexOf(QUICKNODE_HTTPS_10),
                1,
            );

        return httpsEndpoints;
    }

    static getWssEndpoints() {
        const wssEndpoints = [
            QUICKNODE_WSS_1,
            QUICKNODE_WSS_2,
            QUICKNODE_WSS_3,
            QUICKNODE_WSS_4,
            QUICKNODE_WSS_5,
            QUICKNODE_WSS_6,
            QUICKNODE_WSS_7,
            QUICKNODE_WSS_8,
            QUICKNODE_WSS_9,
            QUICKNODE_WSS_10,
        ];

        if (!QUICKNODE_WSS_1)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_1), 1);
        if (!QUICKNODE_WSS_2)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_2), 1);
        if (!QUICKNODE_WSS_3)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_3), 1);
        if (!QUICKNODE_WSS_4)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_4), 1);
        if (!QUICKNODE_WSS_5)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_5), 1);
        if (!QUICKNODE_WSS_6)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_6), 1);
        if (!QUICKNODE_WSS_7)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_7), 1);
        if (!QUICKNODE_WSS_8)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_8), 1);
        if (!QUICKNODE_WSS_9)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_9), 1);
        if (!QUICKNODE_WSS_10)
            wssEndpoints.splice(wssEndpoints.indexOf(QUICKNODE_WSS_10), 1);

        return wssEndpoints;
    }

    static getAllEndpoints() {
        const httpsEndpoints = this.getHttpsEndpoints();
        const wssEndpoints = this.getWssEndpoints();
        return {
            httpsEndpoints,
            wssEndpoints,
        };
    }
}

export default Endpoints;
