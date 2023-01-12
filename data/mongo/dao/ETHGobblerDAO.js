import dotenv from "dotenv";
dotenv.config();

import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobbler from "../models/ETHGobbler.js";
import ETHGobblerImageDAO from "./ETHGobblerImageDAO.js";

const CURRENT_HOST = process.env.CURRENT_HOST;
const ONE_DAY = 1000 * 60 * 60 * 24;

function getImageURL(tokenID) {
    return `${CURRENT_HOST}/image/${tokenID}`;
}

function getAge(createdAt) {
    const days = Math.floor((Date.now() - createdAt) / ONE_DAY);
    if (days === 1) {
        return `${days} day`;
    }

    return `${days} days`;
}

class ETHGobblerDAO {
    static create(spec) {
        spec.createdAt = Date.now();
        const gobbler = new ETHGobbler(spec);
        return __BaseDAO__.__save__(gobbler);
    }

    static get(query) {
        return __BaseDAO__.__get__(ETHGobbler, query);
    }

    static metadata(query) {
        return new Promise((resolve, reject) => {
            this.get(query)
                .then((gobbler) => {
                    if (gobbler.tokenID < 2000) {
                        ETHGobblerImageDAO.get(query)
                            .then((gobImage) => {
                                const body = gobImage.body;
                                const tokenID = gobbler.tokenID;
                                const name = `Gooey #${tokenID}`;
                                const description =
                                    "ETH Gobblers, a Christmas project by Omakasea.";
                                const image = getImageURL(tokenID);
                                const attributes = [];

                                const attrObj = {
                                    generation: gobbler.generation,
                                    health: gobbler.health,
                                    disposition: gobbler.disposition,
                                    age: getAge(gobbler.createdAt),
                                    isAwake: gobbler.isAwake,
                                    isBuried: gobbler.isBuried,
                                    body,
                                    mitosisCredits: gobbler.mitosisCount,
                                    parentID: gobbler.parentTokenID,
                                };

                                for (const key of Object.keys(attrObj)) {
                                    attributes.push({
                                        trait_type: key,
                                        value: attrObj[key],
                                    });
                                }

                                resolve({
                                    meta: {
                                        name,
                                        description,
                                        image,
                                        attributes,
                                    },
                                    isAwake: gobbler.isAwake,
                                });
                            })
                            .catch(reject);
                    } else {
                        const tokenID = gobbler.tokenID;
                        const name = `Gooey #${tokenID}`;
                        const description =
                            "ETH Gobblers, a Christmas project by Omakasea.";
                        const image = getImageURL(tokenID);
                        const attributes = [];

                        const attrObj = {
                            generation: gobbler.generation,
                            health: gobbler.health,
                            disposition: gobbler.disposition,
                            age: getAge(gobbler.createdAt),
                            isAwake: gobbler.isAwake,
                            isBuried: gobbler.isBuried,
                            mitosisCredits: gobbler.mitosisCount,
                            parentID: gobbler.parentTokenID,
                        };

                        for (const key of Object.keys(attrObj)) {
                            attributes.push({
                                trait_type: key,
                                value: attrObj[key],
                            });
                        }

                        resolve({
                            meta: {
                                name,
                                description,
                                image,
                                attributes,
                            },
                            isAwake: gobbler.isAwake,
                        });
                    }
                })
                .catch(reject);
        });
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobbler, query, {}, orderBy);
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerDAO;
