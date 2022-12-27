import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerAction from "../models/ETHGobblerAction.js";

class ETHGobblerActionDAO {
    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerAction, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerAction, query, {}, orderBy);
    }

    static create(action) {
        return __BaseDAO__.__save__(new ETHGobblerAction(action));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerActionDAO;
