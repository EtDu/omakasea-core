import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerMitosis from "../models/ETHGobblerMitosis.js";

class ETHGobblerMitosisDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerMitosis, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerMitosis, query, {}, orderBy);
    }

    static create(trait) {
        trait.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerMitosis(trait));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerMitosisDAO;
