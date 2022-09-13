const Sentry = require("@sentry/node");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");
const crypto = require("crypto");

const {
    utils: { getAddress },
} = require("ethers");

const { adminAddresses } = require("../data/Constants");

const MESSAGE = `Welcome to Omakasea! Please sign to continue.\n\nNONCE:\n__NONCE__`;

class Authentication {
    static signRequest(req) {
        const nonce = crypto.randomUUID();
        req.session.nonce = nonce;
        return Authentication.getMessage(nonce);
    }

    static getMessage(nonce) {
        return MESSAGE.replace("__NONCE__", nonce);
    }

    static parse(req) {
        const data = Authentication.getMessage(req.session.nonce);
        const sig = req.headers.sig || req.body.sig || req.query.sig;
        return {
            sig,
            data,
            addr: req.session.address,
        };
    }

    static signSession(req) {
        const auth = Authentication.parse(req);
        req.session.address = Authentication.__authenticate__(auth);
        auth.addr = req.session.address;
        return auth;
    }

    static isAuthorized(auth) {
        if (auth.sig) {
            return auth.addr === Authentication.__authenticate__(auth);
        }
        return false;
    }

    static __authenticate__(auth) {
        const signature = {
            data: auth.data,
            signature: auth.sig,
        };

        return getAddress(recoverPersonalSignature(signature));
    }

    static forAdmin(auth) {
        const admin = this.__authenticate__(auth);
        Sentry.setUser({ username: admin });
        for (const addr of adminAddresses) {
            if (admin === getAddress(addr)) {
                return;
            }
        }
        throw new Error("Not Admin");
    }

    static forSigner(auth) {
        const signer = this.__authenticate__(auth);
        Sentry.setUser({ username: signer });

        ////////////////////
        //
        //
        // select network ??
        //
        //
        ////////////////////

        /////////////////////////////
        //
        //
        // authenticate free user ???
        //
        //
        /////////////////////////////
    }

    static forFreeUser(auth) {
        const freeUser = this.__authenticate__(auth);
        Sentry.setUser({ username: freeUser });

        //////////////////////
        //
        //
        // query database here
        //
        //
        //////////////////////
    }
}

module.exports = Authentication;
