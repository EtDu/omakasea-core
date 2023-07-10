import __BaseDAO__ from "./__BaseDAO__.js";
import MythEquip from "../models/MythWaifuList.js";

class MythWaifuListDAO {
  static async count(query) {
    return MythEquip.countDocuments(query).exec();
  }

  static async get(query) {
    return __BaseDAO__.__get__(MythEquip, query);
  }

  static search(query, orderBy = {}) {
    return __BaseDAO__.__search__(MythEquip, query, {}, orderBy);
  }

  static create(equip) {
    equip.createdAt = Date.now();
    return __BaseDAO__.__save__(new MythEquip(equip));
  }

  static save(doc) {
    return __BaseDAO__.__save__(doc);
  }
}

export default MythWaifuListDAO;
