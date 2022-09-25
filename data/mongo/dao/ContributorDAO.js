const __BaseDAO__ = require("./__BaseDAO__");

const Contributor = require("../models/Contributor");

class ContributorDAO {
    static create(address) {
        return __BaseDAO__.__save__(new Contributor({ address }));
    }

    static isContributor(address) {
        return new Promise((resolve, reject) => {
            const query = { address, isActive: true };
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
