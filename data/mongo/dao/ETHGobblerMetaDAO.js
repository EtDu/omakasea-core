import dotenv from "dotenv";
dotenv.config();

import ethers from "ethers";
import ABI from "../../../../blockchain/EthGobblersABI.js";

import __BaseDAO__ from "./__BaseDAO__.js";

import ETHGobblerMeta from "../models/ETHGobblerMeta.js";
import ETHGobblerImageDAO from "./ETHGobblerImageDAO.js";
import EthersUtil from "../../../util/EthersUtil.js";

import TimeUtil from "../../../../omakasea-core/util/TimeUtil.js";

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const HTTP_RPC_URL = process.env.HTTP_RPC_URL;

const CURRENT_HOST = process.env.CURRENT_HOST;
const ONE_DAY = 1000 * 60 * 60 * 24;

const PAGE_LIMIT = 28;
const HATCHED_GEN = 3;

const PROVIDER = new ethers.providers.JsonRpcProvider(
    HTTP_RPC_URL,
    BLOCKCHAIN_NETWORK,
);

const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, PROVIDER);

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

function baseMetadata(data) {
    const { gobbler, gobImage, ethGobbled } = data;

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

    const finalAttrs = Object.assign(attrObj, gobbler.equippedTraits);

    if (gobImage) {
        finalAttrs.body = gobImage.body;
    }

    if (ethGobbled) {
        finalAttrs.ETHGobbled = ethGobbled;
    }

    for (const key of Object.keys(finalAttrs)) {
        attributes.push({
            trait_type: key,
            value: finalAttrs[key],
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

        let gobImage = null;
        if (gobbler.generation <= HATCHED_GEN) {
            gobImage = await ETHGobblerImageDAO.get({ tokenID });
        }

        metadata.isBuried = isBuried;
        metadata.data = baseMetadata({ gobbler, gobImage });

        await this.save(metadata);

        setTimeout(async () => {
            const amount = await CONTRACT.ETHGobbled(gobbler.tokenID);
            const ethGobbled = EthersUtil.fromWeiBN({ amount, to: "ether" });
            metadata.data = baseMetadata({ gobbler, gobImage, ethGobbled });
            metadata.updatedAt = TimeUtil.now();
            await ETHGobblerMetaDAO.save(metadata);
        }, 3000);

        return metadata.data;
    }

    static async page(queryParams) {
        const { tokenID, generation, health } = queryParams;
        console.log(tokenID, generation, health);

        const generationInt = parseInt(generation);
        const healthInt = parseInt(health);

        let generationValue = generationInt;
        let healthValue = healthInt;

        if (generation == "-1") generationValue = { $ne: generationInt };
        if (health == "-1") healthValue = { $ne: healthInt };

        const query = {
            tokenID: { $gt: tokenID },
            isBuried: false,
            $and: [
                {
                    "data.attributes": {
                        $elemMatch: {
                            trait_type: "generation",
                            value: generationValue,
                        },
                    },
                },
                {
                    "data.attributes": {
                        $elemMatch: {
                            trait_type: "health",
                            value: healthValue,
                        },
                    },
                },
            ],
        };

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
