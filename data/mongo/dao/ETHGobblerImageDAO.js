import fs from "fs/promises";
import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";
import ETHGobblerDAO from "./ETHGobblerDAO.js";
import { ONE_OF_ONE_BODY_NAMES } from "../../../../utils/constants.js";

const CURRENT_HATCH_GEN = 3;

async function assignOneOfOne() {
    const raw = await fs.readFile(ONE_OF_ONE_BODY_NAMES);
    const GEN3_ONE = JSON.parse(raw.toString());
    for (let bodyName of GEN3_ONE) {
        let image = await ETHGobblerImageDAO.get({
            body: bodyName,
        });
        if (!image)
            return { bodyName, index: GEN3_ONE.indexOf(bodyName), done: false };
    }
    return { done: true };
}

async function CREATE_GENERATION_2(parent, gooey, subDir) {
    if (parent !== null) {
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
}

async function CREATE_GENERATION_3(parent, gooey, resultHatch) {
    if (parent !== null) {
        let { baseImage, body } = await ETHGobblerImageDAO.get({
            tokenID: parent.tokenID,
        });

        const { subDir } = resultHatch;
        const { tokenID, generation } = gooey;

        if (subDir == "MAIN") {
            baseImage = baseImage
                .replace("_dua", "_pokegoo_dua")
                .replace("_satu", "_pokegoo_satu");
            if (body === "Goat") {
                body = "Green Hamster";
                baseImage = baseImage.replace("139", "176");
            }
            // 458_nice_pirate_dua
        } else if (subDir == "ONE_OF_ONE") {
            const { bodyName, index } = resultHatch;
            body = bodyName;
            baseImage = `${index}_pokegoo`;
        }

        const image = {
            tokenID,
            generation,
            body,
            baseImage,
            subDir,
        };

        if (resultHatch.pokeganID) {
            image.pokeganID = resultHatch.pokeganID;
        }

        await ETHGobblerImageDAO.create(image);
    }
}

class ETHGobblerImageDAO {
    static async inherit(parent, gooey, resultHatch) {
        if (gooey.generation === CURRENT_HATCH_GEN) {
            const { bodyName, index, done } = await assignOneOfOne();

            if (done) {
                resultHatch = { subDir: "MAIN" };
            } else {
                resultHatch.bodyName = bodyName;
                resultHatch.index = index;
            }

            await CREATE_GENERATION_3(parent, gooey, resultHatch);
        } else if (gooey.generation === 2) {
            await CREATE_GENERATION_2(parent, gooey, resultHatch.subDir);
        }
    }

    static async hatch(gooey, resultHatch) {
        const child = await this.get({ tokenID: gooey.tokenID });
        if (child === null) {
            const parent = await this.getFirstGenParent(gooey);
            await this.inherit(parent, gooey, resultHatch);
        }
    }

    // recursion bisssshhhh
    static async getFirstGenParent(gooey) {
        const parent = await ETHGobblerDAO.get({
            tokenID: gooey.parentTokenID,
        });

        if (!parent) return gooey;

        return await this.getFirstGenParent(parent);
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
