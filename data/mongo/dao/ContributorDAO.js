import __BaseDAO__ from "./__BaseDAO__.js";
import Contributor from "../models/Contributor.js";

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
            ContributorDAO.get(address).then((result) => {
                if (result !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    static get(address) {
        const query = { address };
        return __BaseDAO__.__get__(Contributor, query);
    }

    static listAll() {
        return __BaseDAO__.__search__(Contributor, {});
    }
}

export default ContributorDAO;
