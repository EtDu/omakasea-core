import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import crypto from "crypto";

import ethers from "ethers";
const getAddress = ethers.utils.getAddress;

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;
const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ID}`;

const MGLTH_CONTRACT_ADDRESS = "0xabaCAdabA4A41e86092847d7b07D00094B8203F8";
const MGLTH_COMPARE = MGLTH_CONTRACT_ADDRESS.toLocaleLowerCase();

const METADATA_URL = `${ALCHEMY_URL}/getNFTMetadata?refreshCache=false&contractAddress=${MGLTH_CONTRACT_ADDRESS}&tokenId`;
const TOKENS_OWNED_URL = `${ALCHEMY_URL}/getContractsForOwner?owner`;

class MegalithToken {
    static parse(token) {
        const tokenId = this.getTokenId(token);
        const isVandal = this.isVandal(token);
        const position = this.getPosition(token);
        const seconds = this.getSeconds(token);

        return { tokenId, isVandal, position, seconds };
    }

    static isVandal(token) {
        return this.__getAttr__("Vandal", token) === "true";
    }

    static getPosition(token) {
        const position = this.__getAttr__("Stream Queue Position", token);
        if (position !== null || position !== undefined) {
            return Number(position.replace("/409", ""));
        }

        return null;
    }

    static getSeconds(token) {
        const seconds = this.__getAttr__("Stream Seconds", token);
        if (seconds !== null || seconds !== undefined) {
            return Number(seconds);
        }

        return null;
    }

    static getTokenId(token) {
        try {
            return Number(token.name.split("#")[1]);
        } catch (error) {}
        return null;
    }

    static getMetaData(tokenId) {
        return new Promise((resolve, reject) => {
            const url = `${METADATA_URL}=${tokenId}`;

            axios
                .get(url)
                .then((res) => {
                    if (res.data.metadata) {
                        resolve(res.data.metadata);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    static tokensOwned(address) {
        return new Promise((resolve, reject) => {
            const url = `${TOKENS_OWNED_URL}=${address}`;
            axios
                .get(url)
                .then((res) => {
                    let ids = [];
                    const { contracts } = res.data;

                    let i = 0;
                    const found = [];
                    while (i < contracts.length) {
                        let contract = contracts[i];
                        if (contract.address === MGLTH_COMPARE) {
                            i++;
                            MegalithToken.getMetaData(
                                Number(contract.tokenId),
                            ).then((data) => {
                                found.push(data);
                                if (i === contracts.length) {
                                    resolve(found);
                                }
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    static verify(req) {
        const message = req.body.message;
        const data = JSON.parse(message);
        const sig = req.body.sig;

        const signature = {
            data: message,
            signature: sig,
        };

        const tokenId = data.tokenId;
        const address = getAddress(recoverPersonalSignature(signature));
        const isValid = address === data.address && tokenId !== null;
        return { address, isValid, tokenId };
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
