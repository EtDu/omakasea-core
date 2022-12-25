import dotenv from "dotenv";
dotenv.config();

import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobbler from "../models/ETHGobbler.js";

const CURRENT_HOST = process.env.CURRENT_HOST;
const ONE_DAY = 1000 * 60 * 60 * 24;

function getImageURL(tokenID) {
    return `${CURRENT_HOST}/image/${tokenID}.gif`;
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

    static fetch(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(ETHGobbler, query)
                .then((results) => {
                    if (results.length > 0) {
                        const doc = results[0];
                        const tokenID = doc.tokenID;
                        const name = `Gooey #${tokenID}`;
                        const description =
                            "ETH Gobblers, a Christmas project by Omakasea.";
                        const image = getImageURL(tokenID);
                        const attributes = [];

                        const attrObj = {
                            generation: doc.generation,
                            health: doc.health,
                            disposition: doc.disposition,
                            age: getAge(doc.createdAt),
                            isAwake: doc.isAwake,
                            isBuried: doc.isBuried,
                        };

                        for (const key of Object.keys(attrObj)) {
                            attributes.push({
                                trait_type: key,
                                value: attrObj[key],
                            });
                        }

                        resolve({
                            name,
                            description,
                            image,
                            attributes,
                        });
                    } else {
                        reject();
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
