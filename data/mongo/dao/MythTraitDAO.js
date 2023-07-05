import __BaseDAO__ from "./__BaseDAO__.js";
import MythTrait from "../models/MythEquip.js";

class MythTraitDAO {
    static async count(query) {
        return MythTrait.countDocuments(query).exec();
    }

    static get(query) {
        return __BaseDAO__.__get__(MythTrait, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(MythTrait, query, {}, orderBy);
    }

    static create(trait) {
        trait.createdAt = Date.now();
        return __BaseDAO__.__save__(new MythTrait(trait));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }

    static fetch(tokenID) {
        return new Promise((resolve, reject) => {
            const query = {
                gobblerID: tokenID,
                traitID: null,
            };
            __BaseDAO__
                .__search__(
                    MythTrait,
                    query,
                    {},
                    { gobblerID: 1, createdAt: 1 },
                )
                .then((results) => {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject();
                    }
                })
                .catch(reject);
        });
    }

    static async DELETE(trait) {
        await MythTrait.deleteOne(trait);
    }
}

export default MythTraitD