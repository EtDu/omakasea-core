import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerEffect from "../models/ETHGobblerEffect.js";

class ETHGobblerEffectDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerEffect, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerEffect, query, {}, orderBy);
    }

    static create(consume) {
        consume.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerEffect(consume));
    }

    static insert(action) {
        return __BaseDAO__.__save__(new ETHGobblerEffect(action));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerEffectDAO;
