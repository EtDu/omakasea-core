import dotenv from "dotenv";
dotenv.config();

import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobbler from "../models/ETHGobbler.js";
import ETHGobblerImageDAO from "./ETHGobblerImageDAO.js";
import ETHGobblerMetaDAO from "./ETHGobblerMetaDAO.js";

const CURRENT_HOST = process.env.CURRENT_HOST;
const ONE_DAY = 1000 * 60 * 60 * 24;

const PAGE_LIMIT = 28;
const HATCHED_GEN = 1;

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

function baseMetadata(gobbler, gobImage = null) {
    const tokenID = gobbler.tokenID;
    const name = `Gooey #${tokenID}`;
    const description = "ETH Gobblers, a Christmas project by Omakasea.";
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

    if (gobImage !== null) {
        attrObj.body = gobImage.body;
    }

    for (const key of Object.keys(attrObj)) {
        attributes.push({
            trait_type: key,
            value: attrObj[key],
        });
    }

    return {
        meta: {
            name,
            description,
            image,
            attributes,
        },
        isAwake: gobbler.isAwake,
    };
}

class ETHGobblerDAO {
    static async addName(spec) {
        const { tokenID, name } = spec;
        const gobbler = await ETHGobblerDAO.get({ tokenID, name: null });

        if (gobbler !== null) {
            gobbler.name = name;
            await ETHGobblerDAO.save(gobbler);
            return true;
        }

        return false;
    }

    static create(spec) {
        spec.createdAt = Date.now();
        const gobbler = new ETHGobbler(spec);
        return this.save(gobbler);
    }

    static get(query) {
        return __BaseDAO__.__get__(ETHGobbler, query);
    }

    static async page(tokenID) {
        const query = { tokenID: { $gt: tokenID }, isBuried: false };
        const fields = {};
        const orderBy = { tokenID: 1 };
        const limit = PAGE_LIMIT;
        const results = await __BaseDAO__.__search__(
            ETHGobbler,
            query,
            fields,
            orderBy,
            limit,
        );

        const allMeta = [];
        for (const row of results) {
            if (row.generation <= HATCHED_GEN) {
                const image = await ETHGobblerImageDAO.get({ tokenID });
                const metadata = baseMetadata(row, image);
                metadata.tokenID = row.tokenID;
                allMeta.push(metadata);
            } else {
                const metadata = baseMetadata(row, image);
                metadata.tokenID = row.tokenID;
                allMeta.push(metadata);
            }
        }

        return allMeta;
    }

    static metadata(query) {
        return new Promise((resolve, reject) => {
            this.get(query)
                .then((gobbler) => {
                    if (gobbler.tokenID < 2000) {
                        ETHGobblerImageDAO.get(query)
                            .then((gobImage) => {
                                const metadata = baseMetadata(
                                    gobbler,
                                    gobImage,
                                );
                                resolve(metadata);
                            })
                            .catch(reject);
                    } else {
                        const metadata = baseMetadata(gobbler);
                        resolve(metadata);
                    }
                })
                .catch(reject);
        });
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobbler, query, {}, orderBy);
    }

    static async save(doc) {
        await ETHGobblerMetaDAO.update(doc);
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerDAO;
