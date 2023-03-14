import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerEquip from "../models/ETHGobblerEquip.js";

class ETHGobblerEquipDAO {
    static async count(query) {
        return ETHGobblerEquip.countDocuments(query).exec();
    }

    static async wipe(tokenID) {
        const equip = await this.get({ tokenID });
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

    static async get(query) {
        const result = await __BaseDAO__.__get__(ETHGobblerEquip, query);
        if (!result && query.tokenID) {
            return this.create({ tokenID: query.tokenID });
        } else if (!result) {
            return this.create({});
        }
        return result;
    }
    static async slotsOnly(query) {
        const result = await this.get(query);
        if (!result) return null;
        const equipDoc = result._doc;
        delete equipDoc.tokenID;
        delete equipDoc.createdAt;
        delete equipDoc.__v;
        delete equipDoc._id;
        return equipDoc;
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
