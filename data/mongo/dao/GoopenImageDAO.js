import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import GoopenImage from "../models/GoopenImage.js";

class GoopenImageDAO {
    static async save(image) {
        return __BaseDAO__.__save__(image);
    }

    static async create(image) {
        return __BaseDAO__.__save__(new GoopenImage(image));
    }

    static get(query) {
        return __BaseDAO__.__get__(GoopenImage, query);
    }

    static search(query) {
        return __BaseDAO__.__search__(GoopenImage, query, {}, { createdAt: 1 });
    }
}

export default GoopenImageDAO;
