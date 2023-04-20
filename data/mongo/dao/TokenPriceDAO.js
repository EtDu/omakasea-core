
import __BaseDAO__ from "./__BaseDAO__.js";
import TokenPrice from "../models/TokenPrice.js";

class TokenPriceDAO {
  static get(query) {
    return new Promise((resolve, reject) => {
      __BaseDAO__
        .__get__(TokenPrice, query)
        .then((document) => {
          if (document !== null) {
            resolve(document);
          } else {
            reject(null);
          }
        })
        .catch(reject);
    });
  }

  static search(query, fields = {}) {
    return __BaseDAO__.__search__(TokenPrice, query, fields);
  }

  static save(document) {
    return __BaseDAO__.__save__(document);
  }
}

export default TokenPriceDAO;
