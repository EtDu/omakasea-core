import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";

const CURRENT_HATCH_GEN = 2;

async function CREATE_GENERATION_2(parent, gooey, subDir) {
    let { baseImage, body } = await ETHGobblerImageDAO.get({
        tokenID: parent.tokenID,
    });

    baseImage = baseImage
        .replace("_dua", "_pirate_dua")
        .replace("_satu", "_pirate_satu");

    if (body === "Goat") {
        body = "Green Hamster";
        baseImage = baseImage.replace("139", "176");
    }

    const { tokenID, generation } = gooey;

    const image = {
        tokenID,
        generation,
        body,
        baseImage,
        subDir,
    };

    await ETHGobblerImageDAO.create(image);
}

class ETHGobblerImageDAO {
    static async inherit(parent, gooey, subDir) {
        if (gooey.generation === CURRENT_HATCH_GEN) {
            await CREATE_GENERATION_2(parent, gooey, subDir);
        }
    }

    static async hatch(gooey, subDir = "MAIN") {
        const child = await this.get({ tokenID: gooey.tokenID });
        if (child === null) {
            const parent = await this.get({
                tokenID: gooey.parentTokenID,
            });

            await this.inherit(parent, gooey, subDir);
        }
    }

    static async count(query) {
        return ETHGobblerImage.countDocuments(query).exec();
    }

    static get(query = {}) {
        return __BaseDAO__.__get__(ETHGobblerImage, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerImage, query, {}, orderBy);
    }

    static create(spec) {
        return __BaseDAO__.__save__(new ETHGobblerImage(spec));
    }

    static save(spec) {
        spec.updatedAt = Date.now();
        return __BaseDAO__.__save__(spec);
    }
}

export default ETHGobblerImageDAO;
