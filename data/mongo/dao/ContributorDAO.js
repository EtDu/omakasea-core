const __BaseDAO__ = require("./__BaseDAO__");

const Contributor = require("../models/Contributor");

class ContributorDAO {
    static insert(contributor) {
        return new Promise((resolve, reject) => {
            ContributorDAO.isContributor(contributor.address).then((exists) => {
                if (!exists) {
                    __BaseDAO__
                        .__save__(new Contributor(contributor))
                        .then(() => {
                            resolve();
                        });
                } else {
                    reject();
                }
            });
        });
    }

    static create(address) {
        return __BaseDAO__.__save__(new Contributor({ address }));
    }

    static isContributor(address) {
        return new Promise((resolve, reject) => {
            const query = { address };
            __BaseDAO__.__get__(Contributor, query).then((result) => {
                if (result !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    static listAll() {
        return __BaseDAO__.__search__(Contributor, {});
    }
}

module.exports = ContributorDAO;
