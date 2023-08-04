import __BaseDAO__ from "./__BaseDAO__.js";
import MythPotion from "../models/WaifuPotionModel.js";

class MythPotionDAO {
  static async count(query) {
    return MythPotion.countDocuments(query).exec();
  }

  static async get(query) {
    return __BaseDAO__.__get__(MythPotion, query);
  }

  static search(query, orderBy = {}) {
    return __BaseDAO__.__search__(MythPotion, query, {}, orderBy);
  }

  static create(equip) {
    equip.createdAt = Date.now();
    return __BaseDAO__.__save__(new MythPotion(equip));
  }

  static save(doc) {
    return __BaseDAO__.__save__(doc);
  }

  static delete(query) {
    return __BaseDAO__.__delete__(MythPotion, query);
  }
}

export default MythPotionDAO;
