import dotenv from "dotenv";
dotenv.config();

import __BaseDAO__ from "./__BaseDAO__.js";

import ETHGobblerMeta from "../models/ETHGobblerMeta.js";
import ETHGobblerImageDAO from "./ETHGobblerImageDAO.js";

import TimeUtil from "../../../../omakasea-core/util/TimeUtil.js";

const CURRENT_HOST = process.env.CURRENT_HOST;
const ONE_DAY = 1000 * 60 * 60 * 24;

const PAGE_LIMIT = 28;
const HATCHED_GEN = 2;

function getImageURL(tokenID) {
    return `${CURRENT_HOST}/image/${tokenID}`;
}

function getAge(gobbler) {
    const createdAt = gobbler.createdAt;
    const days = Math.floor((Date.now() - createdAt) / ONE_DAY);
    if (days === 1) {
        return `${days} day`;
    }

    if (gobbler.isBuried) {
        return "deceased";
    }

    return `${days} days`;
}

function baseMetadata(gobbler, gobImage = null) {
    const tokenID = gobbler.tokenID;
    const name = gobbler.name === null ? `Gooey #${tokenID}` : gobbler.name;
    const description = "ETH Gobblers, a Christmas project by Omakasea.";
    const image = getImageURL(tokenID);
    const attributes = [];

    const attrObj = {
        generation: gobbler.generation,
        health: gobbler.health,
        disposition: gobbler.disposition,
        age: getAge(gobbler),
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
        tokenID,
        name,
        description,
        image,
        attributes,
    };
}

class ETHGobblerMetaDAO {
    static async update(gobbler) {
        const { tokenID, isBuried } = gobbler;
        const query = { tokenID };
        let metadata = await this.get(query);

        if (metadata === null) {
            metadata = new ETHGobblerMeta({
                tokenID,
                isBuried,
            });
        }

        let image = null;
        if (gobbler.generation <= HATCHED_GEN) {
            image = await ETHGobblerImageDAO.get({ tokenID });
        }

        metadata.isBuried = isBuried;
        metadata.data = baseMetadata(gobbler, image);
        metadata.updatedAt = TimeUtil.now();

        await this.save(metadata);

        return metadata.data;
    }

    static async page(tokenID) {
        const query = { tokenID: { $gt: tokenID }, isBuried: false };
        const fields = {};
        const orderBy = { tokenID: 1 };
        const limit = PAGE_LIMIT;
        const results = await __BaseDAO__.__search__(
            ETHGobblerMeta,
            query,
            fields,
            orderBy,
            limit,
        );

        const allMeta = [];
        for (const row of results) {
            row.data.tokenID = row.tokenID;
            allMeta.push(row.data);
        }

        return allMeta;
    }

    static async getData(query) {
        const metadata = await this.get(query);
        if (metadata) {
            return metadata.data;
        }
        return null;
    }

    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerMeta, query);
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerMetaDAO;
