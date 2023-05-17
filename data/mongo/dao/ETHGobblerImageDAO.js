import fs from "fs/promises";
import path from "path";
import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";
import ETHGobblerDAO from "./ETHGobblerDAO.js";
import { ONE_OF_ONE_BODY_NAMES_DIR } from "../../../../utils/constants.js";

const CURRENT_HATCH_GEN = 5;

async function assignOneOfOne(bodiesFileName) {
    const raw = await fs.readFile(
        path.join(ONE_OF_ONE_BODY_NAMES_DIR, bodiesFileName),
    );
    const bodyList = JSON.parse(raw.toString());
    for (let bodyName of bodyList) {
        let image = await ETHGobblerImageDAO.get({
            body: bodyName,
        });
        if (!image)
            return { bodyName, index: bodyList.indexOf(bodyName), done: false };
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
    const { bodyName, index, done } = await assignOneOfOne("GEN_3_ONE.json");

    if (done) {
        resultHatch = { subDir: "MAIN" };
    } else {
        resultHatch.bodyName = bodyName;
        resultHatch.index = index;
    }

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

async function CREATE_GENERATION_4(parent, gooey, subDir) {
    if (parent !== null) {
        let { baseImage, body } = await ETHGobblerImageDAO.get({
            tokenID: parent.tokenID,
        });

        baseImage = baseImage
            .replace("_dua", "_pixel_dua")
            .replace("_satu", "_pixel_satu");

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

async function CREATE_GENERATION_5(parent, gooey, resultHatch) {
    const { bodyName, index, done } = await assignOneOfOne("GEN_5_ONE.json");

    if (done) {
        resultHatch = { subDir: "MAIN" };
    } else {
        resultHatch.bodyName = bodyName;
        resultHatch.index = index;
    }

    if (parent !== null) {
        let { baseImage, body } = await ETHGobblerImageDAO.get({
            tokenID: parent.tokenID,
        });

        const { subDir } = resultHatch;
        const { tokenID, generation } = gooey;

        const baseImageNames = [
            "pepe_satu",
            "pepe_dua",
            "pepe_tiga",
            "pepe_empat",
        ];

        if (subDir == "MAIN") {
            body = "pepe";
            baseImage =
                baseImageNames[
                    Math.floor(Math.random() * baseImageNames.length)
                ];
        } else if (subDir == "ONE_OF_ONE") {
            const { bodyName, index } = resultHatch;
            body = bodyName;
            baseImage = `${index}_war`;
        }

        const image = {
            tokenID,
            generation,
            body,
            baseImage,
            subDir,
        };

        if (resultHatch.PLAID) {
            image.PLAID = resultHatch.PLAID;
        }

        await ETHGobblerImageDAO.create(image);
    }
}

async function CREATE_JELLY(parent, gooey, resultHatch) {
    const { bodyName, index, done } = await assignOneOfOne("JELLYS.json");

    if (done) {
        return { noneLeft: true };
    } else {
        resultHatch.bodyName = bodyName;
        resultHatch.index = index;
    }

    if (parent !== null) {
        let { baseImage, body } = await ETHGobblerImageDAO.get({
            tokenID: parent.tokenID,
        });

        const { tokenID, generation } = gooey;

        const { bodyName, index } = resultHatch;
        body = bodyName;
        baseImage = `${index}_hexgoo`;

        const image = {
            tokenID,
            generation,
            body,
            baseImage,
            subDir: "ONE_OF_ONE",
        };

        if (resultHatch.licenseID) {
            image.licenseID = resultHatch.licenseID;
        }

        if (resultHatch.jellyIDs) {
            image.jellyIDs = resultHatch.jellyIDs;
        }

        await ETHGobblerImageDAO.create(image);
    }
}

class ETHGobblerImageDAO {
    static async inherit(parent, gooey, resultHatch) {
        // different case for jelly goos
        if (resultHatch.licenseID || resultHatch.jellyIDs) {
            const result = await CREATE_JELLY(parent, gooey, resultHatch);
            if (!result.noneLeft) return;
        }

        switch (gooey.generation) {
            case CURRENT_HATCH_GEN:
                await CREATE_GENERATION_5(parent, gooey, resultHatch);
                break;
            case 4:
                await CREATE_GENERATION_4(parent, gooey, resultHatch.subDir);
                break;
            case 3:
                await CREATE_GENERATION_3(parent, gooey, resultHatch);
                break;
            case 2:
                await CREATE_GENERATION_2(parent, gooey, resultHatch.subDir);
                break;
        }
    }

    static async assignImages(gooey, resultHatch) {
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
