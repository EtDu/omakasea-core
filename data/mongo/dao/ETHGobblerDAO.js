import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobbler from "../models/ETHGobbler.js";

function getAge(createdAt) {
    return createdAt;
}

class ETHGobblerDAO {
    static create(spec) {
        const { tokenID, disposition } = spec;
        const gobbler = new ETHGobbler({
            tokenID,
            disposition,
            createdAt: Date.now(),
        });

        return __BaseDAO__.__save__(gobbler);
    }

    static get(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__get__(ETHGobbler, query)
                .then((doc) => {
                    if (doc !== null) {
                        const gobbler = {
                            name: `Gobbler #${doc.tokenID}`,
                            disposition: doc.disposition,
                            health: doc.health,
                            isBuried: doc.isBuried,
                            age: getAge(doc.createdAt),
                        };

                        resolve(gobbler);
                    } else {
                        reject();
                    }
                })
                .catch(reject);
        });
    }

    static search(query, fields = {}) {
        return __BaseDAO__.__search__(ETHGobbler, query, fields);
    }

    static save(doc) {
        return __BaseDAO__.__save__(doc);
    }
}

export default ETHGobblerDAO;
