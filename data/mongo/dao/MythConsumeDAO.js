import __BaseDAO__ from "./__BaseDAO__.js";
import MythConsume from "../models/MythConsumeModel.js";

class MythConsumeDAO {
  static async count(query) {
    return MythConsume.countDocuments(query).exec();
  }

  static async get(query) {
    return __BaseDAO__.__get__(MythConsume, query);
  }

  static search(query, orderBy = {}) {
    return __BaseDAO__.__search__(MythConsume, query, {}, orderBy);
  }

  static create(equip) {
    equip.createdAt = Date.now();
    return __BaseDAO__.__save__(new MythConsume(equip));
  }

  static save(doc) {
    return __BaseDAO__.__save__(doc);
  }
}

export default MythConsumeDAO;
