import __BaseDAO__ from "./__BaseDAO__.js";
import MythWeapon from "../models/WaifuWeaponModel.js";

class MythWeaponMetadataDAO {
  static async count(query) {
    return MythWeapon.countDocuments(query).exec();
  }

  static async get(query) {
    return __BaseDAO__.__get__(MythWeapon, query);
  }

  static search(query, orderBy = {}) {
    return __BaseDAO__.__search__(MythWeapon, query, {}, orderBy);
  }

  static create(equip) {
    equip.createdAt = Date.now();
    return __BaseDAO__.__save__(new MythWeapon(equip));
  }

  static save(doc) {
    return __BaseDAO__.__save__(doc);
  }
}

export default MythWeaponMetadataDAO;
