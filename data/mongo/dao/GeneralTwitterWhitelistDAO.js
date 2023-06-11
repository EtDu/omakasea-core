import crypto from "crypto";
import ShortHash from "short-hash";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import ethers from "ethers";
const getAddress = ethers.utils.getAddress;

import __BaseDAO__ from "./MythDao.js";
import GeneralTwitterWhitelist from "../models/GeneralTwitterWhitelist.js";

class GeneralTwitterWhitelistDAO {
  static readSignature(req) {
    return new Promise((resolve, reject) => {
      const sig = req.body.sig;
      const message = req.body.message;
      const address = getAddress(
        recoverPersonalSignature({
          data: message,
          signature: sig,
        })
      );
        console.log(address)
      resolve({ address, message });
    });
  }

  static get(query) {
    return new Promise((resolve, reject) => {
      __BaseDAO__
        .__get__(GeneralTwitterWhitelist, query)
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

  static getAddress(address) {
    return new Promise((resolve, reject) => {
      __BaseDAO__
        .getByAddress(GeneralTwitterWhitelist, address)
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
    return __BaseDAO__.__search__(GeneralTwitterWhitelist, query, fields);
  }

  static save(document) {
    return __BaseDAO__.__save__(document);
  }

  static createLinks(address) {
    return new Promise((resolve, reject) => {
      const createdAt = Date.now();
      const links = {
        naughty: {
          side: "naughty",
          inviteID: ShortHash(crypto.randomUUID()),
          originator: address,
          createdAt,
        },
        nice: {
          side: "nice",
          inviteID: ShortHash(crypto.randomUUID()),
          originator: address,
          createdAt,
        },
      };

      __BaseDAO__.__save__(new GeneralTwitterWhitelist(links.naughty)).then(() => {
        __BaseDAO__.__save__(new GeneralTwitterWhitelist(links.nice)).then(() => {
          resolve([links.naughty, links.nice]);
        });
      });
    });
  }

  static async seed(address, host) {
    const createdAt = Date.now();
    const links = [];
  
    for (let i = 0; i < 50; i++) {
      const entry = {
        inviteID: ShortHash(crypto.randomUUID()),
        originator: address,
        createdAt,
      };
  
      try {
        const doc = await __BaseDAO__.__save__(new GeneralTwitterWhitelist(entry));
        links.push(`${host}/whitelist/invite/${doc.inviteID}`);
      } catch (error) {
        console.error(error);
      }
    }
    console.log(links)
    return links;
  }


}

export default GeneralTwitterWhitelistDAO;
