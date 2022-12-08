import crypto from "crypto";
import ShortHash from "short-hash";

import ethers from "ethers";
const getAddress = ethers.utils.getAddress;

import __BaseDAO__ from "./__BaseDAO__.js";
import GobblerOwner from "../models/GobblerOwner.js";

class GobblerOwnerDAO {
    static readSignature(req) {
        return new Promise((resolve, reject) => {
            const sig = req.body.sig;
            const message = JSON.parse(req.body.message);
            const address = getAddress(
                recoverPersonalSignature({
                    data: message,
                    signature: sig,
                }),
            );

            resolve({ address, message });
        });
    }

    static get(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(GobblerOwner, query).then((document) => {
                if (document !== null) {
                    resolve(document);
                } else {
                    reject();
                }
            });
        });
    }

    static search(query, fields = {}) {
        return __BaseDAO__.__search__(GobblerOwner, query, fields);
    }

    static createLinks(address) {
        return new Promise((resolve, reject) => {
            const createdAt = Date.now();
            const links = {
                naughty: {
                    side: "naughty",
                    inviteID: ShortHash(crypto.randomUUID()),
                    originator: address,
                    createdAt,
                },
                nice: {
                    side: "nice",
                    inviteID: ShortHash(crypto.randomUUID()),
                    originator: address,
                    createdAt,
                },
            };

            __BaseDAO__.__save__(new GobblerOwner(links.naughty)).then(() => {
                __BaseDAO__.__save__(new GobblerOwner(links.nice)).then(() => {
                    resolve(links);
                });
            });
        });
    }
}

export default GobblerOwnerDAO;
