import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerGobDrop from "../models/ETHGobblerGobDrop.js";

class ETHGobblerGobDropDAO {
    static async mintActive(dropID) {
        const current = await __BaseDAO__.__get__(ETHGobblerGobDrop, {
            isActive: true,
        });
        if (current !== null) {
            return JSON.parse(
                current.template.replaceAll("GOB_DROP_ID", dropID),
            );
        }
        return null;
    }

    static async current() {
        return this.get({ isActive: true });
    }

    static async count(query) {
        return ETHGobblerGobDrop.countDocuments(query).exec();
    }

    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerGobDrop, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerGobDrop, query, {}, orderBy);
    }

    static deploy(gobdrop) {
        gobdrop.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerGobDrop(gobdrop));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerGobDropDAO;
