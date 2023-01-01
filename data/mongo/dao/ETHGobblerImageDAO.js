import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerImage from "../models/ETHGobblerImage.js";

class ETHGobblerImageDAO {
    static get(query = {}) {
        return __BaseDAO__.__get__(ETHGobblerImage, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerImage, query, {}, orderBy);
    }

    static create(price) {
        return __BaseDAO__.__save__(new ETHGobblerImage(price));
    }

    static save(price) {
        price.updatedAt = Date.now();
        return __BaseDAO__.__save__(price);
    }
}

export default ETHGobblerImageDAO;
