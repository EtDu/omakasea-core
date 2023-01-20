import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerMitosis from "../models/ETHGobblerMitosis.js";

class ETHGobblerMitosisDAO {
    static async count(query) {
        return ETHGobblerMitosis.countDocuments(query).exec();
    }

    static get(query) {
        return __BaseDAO__.__get__(ETHGobblerMitosis, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerMitosis, query, {}, orderBy);
    }

    static create(trait) {
        trait.createdAt = Date.now();
        return __BaseDAO__.__save__(new ETHGobblerMitosis(trait));
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }

    static fetch(tokenID) {
        return new Promise((resolve, reject) => {
            const query = {
                parentID: tokenID,
                childID: null,
            };
            __BaseDAO__
                .__search__(
                    ETHGobblerMitosis,
                    query,
                    {},
                    { parentID: 1, createdAt: 1 },
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
}

export default ETHGobblerMitosisDAO;
