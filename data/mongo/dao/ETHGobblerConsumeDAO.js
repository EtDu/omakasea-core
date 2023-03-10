import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerConsume from "../models/ETHGobblerConsume.js";

class ETHGobblerConsumeDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerConsume, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerConsume, query, {}, orderBy);
    }

    static create(consume) {
        consume.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerConsume(consume));
    }

    static insert(action) {
        return __BaseDAO__.__save__(new ETHGobblerConsume(action));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerConsumeDAO;
