import __BaseDAO__ from "./__BaseDAO__.js";
import PepeAttack from "../models/PepeAttack.js";

class ETHGobblerPepeAttackDAO {
    static get(query) {
        return __BaseDAO__.__get__(PepeAttack, query);
    }

    static create(pepeAttack) {
        pepeAttack.createdAt = Date.now();
        return __BaseDAO__.__save__(new PepeAttack(pepeAttack));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerPepeAttackDAO;
