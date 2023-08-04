import __BaseDAO__ from "./__BaseDAO__.js";
import MythWarrior from "../models/WaifuWarriorModel.js";

class MythWarriorDAO {
  static async count(query) {
    return MythWarrior.countDocuments(query).exec();
  }

  static async get(query) {
    return __BaseDAO__.__get__(MythWarrior, query);
  }

  static search(query, orderBy = {}) {
    return __BaseDAO__.__search__(MythWarrior, query, {}, orderBy);
  }

  static create(equip) {
    equip.createdAt = Date.now();
    return __BaseDAO__.__save__(new MythWarrior(equip));
  }

  static save(doc) {
    return __BaseDAO__.__save__(doc);
  }
}

export default MythWarriorDAO;
