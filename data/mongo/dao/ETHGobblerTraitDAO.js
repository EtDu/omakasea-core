import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerTrait from "../models/ETHGobblerTrait.js";

class ETHGobblerActionDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerTrait, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerTrait, query, {}, orderBy);
    }

    static create(trait) {
        trait.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerTrait(trait));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerActionDAO;
