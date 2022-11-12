import __BaseDAO__ from "./__BaseDAO__.js";
import Contributor from "../models/Contributor.js";

const TOKEN_ID = 9999;
const MGLTH_TOKEN = {
    tokenId: TOKEN_ID,
    position: 9999,
    isVandal: true,
};

class ContributorDAO {
    static insert(contributor) {
        return new Promise((resolve, reject) => {
            ContributorDAO.isContributor(contributor.address).then((exists) => {
                if (!exists) {
                    __BaseDAO__
                        .__save__(
                            new Contributor({
                                ...contributor,
                                tokenId: TOKEN_ID,
                                token: MGLTH_TOKEN,
                                isActive: true,
                            }),
                        )
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
            ContributorDAO.get({ address, isActive: true }).then((result) => {
                if (result !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    static get(query) {
        return __BaseDAO__.__get__(Contributor, query);
    }

    static search() {
        return __BaseDAO__.__search__(Contributor, {});
    }
}

export default ContributorDAO;
