import __BaseDAO__ from "./__BaseDAO__.js";
import MythAllNFTModel from "../models/MythAllNFTModel.js";

class MythAllNFTDAO {
    static async count(query) {
        return MythAllNFTModel.countDocuments(query).exec();
    }

    static async get(query) {
       return __BaseDAO__.__get__(MythAllNFTModel, query);   
    }
    
    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(MythAllNFTModel, query, {}, orderBy);
    }

    static create(equip) {
        equip.createdAt = Date.now();
        return __BaseDAO__.__save__(new MythAllNFTModel(equip));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default MythAllNFTDAO;
