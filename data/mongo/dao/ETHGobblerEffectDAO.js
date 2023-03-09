import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblersEffect from "../models/ETHGobblersEffect.js";

class ETHGobblersEffectDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblersEffect, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblersEffect, query, {}, orderBy);
    }

    static create(consume) {
        consume.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblersEffect(consume));
    }

    static insert(action) {
        return __BaseDAO__.__save__(new ETHGobblersEffect(action));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblersEffectDAO;
