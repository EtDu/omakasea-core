import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblersConsume from "../models/ETHGobblersConsume.js";

class ETHGobblersConsumeDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblersConsume, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblersConsume, query, {}, orderBy);
    }

    static create(consume) {
        consume.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblersConsume(consume));
    }

    static insert(action) {
        return __BaseDAO__.__save__(new ETHGobblersConsume(action));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblersConsumeDAO;
