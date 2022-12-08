import crypto from "crypto";
import ShortHash from "short-hash";

import __BaseDAO__ from "./__BaseDAO__.js";
import GobblerOwner from "../models/GobblerOwner.js";

class GobblerOwnerDAO {
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

    static create() {
        return new Promise((resolve, reject) => {
            const createdAt = Date.now();
            const links = {
                naughty: {
                    side: "naughty",
                    inviteID: ShortHash(crypto.randomUUID()),
                    createdAt,
                },
                nice: {
                    side: "nice",
                    inviteID: ShortHash(crypto.randomUUID()),
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
