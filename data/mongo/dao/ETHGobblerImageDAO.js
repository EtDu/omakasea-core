import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";

async function CREATE_GENERATION_2(parent, gooey) {
    let { baseImage, body } = await this.get({
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
    };

    this.create(image);
}

class ETHGobblerImageDAO {
    static async inherit(parent, gooey) {
        if (parent.generation === 1) {
            await CREATE_GENERATION_2(parent, gooey);
        }
    }

    static async hatch(gooey) {
        const child = this.get({ tokenID: gooey.tokenID });
        if (child === null) {
            const parent = await this.get({
                tokenID: gooey.parentTokenID,
            });
            this.inherit(parent, gooey);
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
