import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";

function random(max) {
    return Math.floor(Math.random() * max);
}

class ETHGobblerImageDAO {
    static async assignRandom(gobbler, subDir = null) {
        const { generation } = gobbler;
        const images = this.search({ tokenID: null, generation, subDir });
        const selectedImage = images[random(images.length)];
        selectedImage.tokenID = gobbler;
        await this.save(selectedImage);
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
