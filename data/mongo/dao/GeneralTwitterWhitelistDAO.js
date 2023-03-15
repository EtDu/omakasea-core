import crypto from "crypto";
import ShortHash from "short-hash";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import ethers from "ethers";
const getAddress = ethers.utils.getAddress;

import __BaseDAO__ from "./__BaseDAO__.js";
import TwitterWhitelist from "../models/TwitterWhitelist.js";

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

      resolve({ address, message });
    });
  }

  static get(query) {
    return new Promise((resolve, reject) => {
      __BaseDAO__
        .__get__(TwitterWhitelist, query)
        .then((document) => {
          if (document !== null) {
            resolve(document);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  static search(query, fields = {}) {
    return __BaseDAO__.__search__(TwitterWhitelist, query, fields);
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

      __BaseDAO__.__save__(new TwitterWhitelist(links.naughty)).then(() => {
        __BaseDAO__.__save__(new TwitterWhitelist(links.nice)).then(() => {
          resolve([links.naughty, links.nice]);
        });
      });
    });
  }

  static seed(address, host) {
    return new Promise((resolve, reject) => {
      const createdAt = Date.now();
      const links = [];
      let i = 0;
      while (i < 50) {
        const entry = {
          inviteID: ShortHash(crypto.randomUUID()),
          originator: address,
          createdAt,
        };

        __BaseDAO__.__save__(new TwitterWhitelist(entry)).then((doc) => {
          links.push(`${host}/invite/${doc.inviteID}`);
        });
        i++;
      }
      resolve(links);
    });
  }
}

export default GeneralTwitterWhitelistDAO;
