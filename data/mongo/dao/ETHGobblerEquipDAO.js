import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerEquip from "../models/ETHGobblerEquip.js";

class ETHGobblerEquipDAO {
    static async count(query) {
        return ETHGobblerEquip.countDocuments(query).exec();
    }

    static async wipe(tokenID) {
        const equip = this.get({ tokenID });
        equip.Background = null;
        equip.Weather = null;
        equip.Sidekick = null;
        equip.Food = null;
        equip.Accessory = null;
        equip.Cushion = null;
        equip.Build = null;
        equip.Inflight = null;
        const newEquip = await this.save(equip);
        return newEquip;
    }

    static get(query) {
        const result = __BaseDAO__.__get__(ETHGobblerEquip, query);
        if (!result) return this.create(equip);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerEquip, query, {}, orderBy);
    }

    static create(equip) {
        equip.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerEquip(equip));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerEquipDAO;