import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import ContributorDAO from "../data/mongo/dao/ContributorDAO.js";

import ethers from "ethers";
const getAddress = ethers.utils.getAddress;

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;
const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ID}`;

const MGLTH_CONTRACT_ADDRESS = "0xabaCAdabA4A41e86092847d7b07D00094B8203F8";
const MGLTH_COMPARE = MGLTH_CONTRACT_ADDRESS.toLocaleLowerCase();

const METADATA_URL = `${ALCHEMY_URL}/getNFTMetadata?refreshCache=false&contractAddress=${MGLTH_CONTRACT_ADDRESS}&tokenId`;
const TOKENS_OWNED_URL = `${ALCHEMY_URL}/getContractsForOwner?owner`;

const INVALID_TOKEN = {
    tokenId: null,
    isVandal: null,
    position: null,
    seconds: null,
};

class MegalithToken {
    static isContributor(address) {
        return new Promise((resolve, reject) => {
            ContributorDAO.get({ address, isActive: true })
                .then((contributor) => {
                    if (contributor) {
                        resolve({
                            isActive: true,
                            symbol: contributor.symbol,
                            tokenId: contributor.tokenId,
                        });
                    } else {
                        resolve({ isActive: false });
                    }
                })
                .catch(reject);
        });
    }

    static check(req) {
        return new Promise((resolve, reject) => {
            const message = req.headers.message;
            const data = JSON.parse(message);
            const sig = req.headers.sig;

            const signature = {
                data: message,
                signature: sig,
            };

            const address = getAddress(recoverPersonalSignature(signature));

            let tokenId = Number(data.tokenId);
            let symbol = req.session.symbol;
            if (req.session.tokenId !== tokenId) {
                tokenId = null;
                symbol = null;
            }

            const isAuthorized = address === data.address;
            let result = { isAuthorized, address, tokenId, symbol };

            if (isAuthorized) {
                resolve(result);
            } else {
                MegalithToken.isContributor(address).then((contributor) => {
                    if (contributor.isActive) {
                        result.isAuthorized = true;
                        result.symbol = contributor.symbol;
                        result.tokenId = contributor.tokenId;
                    }
                    resolve(result);
                });
            }
        });
    }

    static authenticate(req) {
        return new Promise((resolve, reject) => {
            const message = req.body.message;
            const data = JSON.parse(message);
            const sig = req.body.sig;

            const signature = {
                data: message,
                signature: sig,
            };

            const tokenId = Number(data.tokenId);
            const address = getAddress(recoverPersonalSignature(signature));
            let symbol = null;
            this.tokensOwned(address).then((tokens) => {
                let hasToken = false;
                for (const token of tokens) {
                    if (!hasToken && token.tokenId === tokenId) {
                        hasToken = true;
                        symbol = token.symbol;
                    }
                }

                const isValid =
                    hasToken && address === data.address && tokenId !== null;

                resolve({ address, isValid, tokenId, symbol });
            });
        });
    }

    static isValid(parsed) {
        let valid = true;
        for (const key of Object.keys(parsed)) {
            valid = !(parsed[key] === null && parsed[key] === undefined);
        }
        return valid;
    }

    static parse(token) {
        if (token.attributes.length > 0) {
            const tokenId = this.getTokenId(token);
            const isVandal = this.isVandal(token);
            const position = this.getPosition(token);
            const seconds = this.getSeconds(token);

            return { tokenId, isVandal, position, seconds };
        }

        return INVALID_TOKEN;
    }

    static isVandal(token) {
        return this.__getAttr__("Vandal", token) === "true";
    }

    static getPosition(token) {
        const position = this.__getAttr__("Stream Queue Position", token);
        if (position !== null && position !== undefined) {
            return Number(position.replace("/409", ""));
        }

        return null;
    }

    static getSeconds(token) {
        let seconds = this.__getAttr__("Stream Seconds", token);
        if (seconds !== null && seconds !== undefined) {
            seconds = Number(seconds);
            seconds = seconds < 10 ? 10 : seconds;
            return seconds;
        }

        return null;
    }

    static getTokenId(token) {
        try {
            return Number(token.name.split("#")[1]);
        } catch (error) {}
        return null;
    }

    static getToken(tokenId) {
        return new Promise((resolve, reject) => {
            if (0 <= tokenId) {
                const url = `${METADATA_URL}=${tokenId}`;

                axios
                    .get(url)
                    .then((res) => {
                        resolve(this.parse(res.data.metadata));
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                resolve({
                    tokenId,
                    isVandal: true,
                    position: 1000,
                    seconds: tokenId,
                });
            }
        });
    }

    static tokensOwned(address) {
        return new Promise((resolve, reject) => {
            const url = `${TOKENS_OWNED_URL}=${address}`;
            axios
                .get(url)
                .then((res) => {
                    const { contracts } = res.data;

                    let i = 0;
                    const found = [];
                    if (contracts.length > 0) {
                        while (i < contracts.length) {
                            let contract = contracts[i];
                            i++;
                            if (contract.address === MGLTH_COMPARE) {
                                MegalithToken.getToken(
                                    Number(contract.tokenId),
                                ).then((data) => {
                                    data.symbol = contract.symbol;
                                    found.push(data);
                                    if (i === contracts.length) {
                                        resolve(found);
                                    }
                                });
                            } else if (i === contracts.length) {
                                resolve(found);
                            }
                        }
                    } else {
                        resolve(found);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    static __getAttr__(key, token) {
        try {
            for (const attr of token.attributes) {
                if (key === attr.trait_type) {
                    return attr.value;
                }
            }
        } catch (error) {}

        return null;
    }
}

export default MegalithToken;
