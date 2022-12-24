import dotenv from "dotenv";
dotenv.config();

import utils from "ethers/lib/utils.js";
import ethers from "ethers";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import { ABI } from "../../../blockchain/EthGobblersABI.js";

import GobblerOwnerDAO from "../data/mongo/dao/GobblerOwnerDAO.js";
import ETHGobblerDAO from "../data/mongo/dao/ETHGobblerDAO.js";

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const BURN_ADDRESS = process.env.BURN_ADDRESS;
const HTTP_RPC_URL = process.env.HTTP_RPC_URL;
const WS_RPC_URL = process.env.WS_RPC_URL;
const HEALTH_DEDUCTION_MAX = process.env.HEALTH_DEDUCTION_MAX;

function toInt(hex) {
    return Number(ethers.utils.formatUnits(hex, 0));
}

function randomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

class ETHGobblerNFT {
    static getBurySignature(fnName, signature, message, tokenID) {
        return new Promise((resolve, reject) => {
            const provider = new ethers.providers.JsonRpcProvider(
                HTTP_RPC_URL,
                BLOCKCHAIN_NETWORK,
            );

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                provider,
            );

            const senderAddress = ethers.utils.getAddress(
                recoverPersonalSignature({ data: message, signature }),
            );

            contract.signatureNonce(senderAddress).then((res) => {
                const sigNonce = res._hex;
                const byteArray = utils.toUtf8Bytes(fnName);
                const fnNameSig = utils.hexlify(byteArray.slice(0, 4));

                const messageHash = utils.solidityKeccak256(
                    ["address", "address", "bytes4", "uint256", "uint256"],
                    [
                        senderAddress,
                        CONTRACT_ADDRESS,
                        fnNameSig,
                        tokenID,
                        sigNonce,
                    ],
                );
                const SIGNER = new ethers.Wallet(
                    process.env.PRIVATE_KEY,
                    provider,
                );

                SIGNER.signMessage(utils.arrayify(messageHash))
                    .then((signature) => {
                        const data = {
                            messageHash,
                            signature,
                        };

                        resolve(data);
                    })
                    .catch(reject);
            });
        });
    }

    static getActionSignature(fnName, signature, message) {
        return new Promise((resolve, reject) => {
            const provider = new ethers.providers.JsonRpcProvider(
                HTTP_RPC_URL,
                BLOCKCHAIN_NETWORK,
            );

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                provider,
            );

            const senderAddress = ethers.utils.getAddress(
                recoverPersonalSignature({ data: message, signature }),
            );

            contract.signatureNonce(senderAddress).then((res) => {
                const sigNonce = res._hex;
                const byteArray = utils.toUtf8Bytes(fnName);
                const fnNameSig = utils.hexlify(byteArray.slice(0, 4));

                const messageHash = utils.solidityKeccak256(
                    ["address", "address", "bytes4", "uint256"],
                    [senderAddress, CONTRACT_ADDRESS, fnNameSig, sigNonce],
                );
                const SIGNER = new ethers.Wallet(
                    process.env.PRIVATE_KEY,
                    provider,
                );

                SIGNER.signMessage(utils.arrayify(messageHash))
                    .then((signature) => {
                        const data = {
                            messageHash,
                            signature,
                        };

                        resolve(data);
                    })
                    .catch(reject);
            });
        });
    }

    static getMintSignature(signature, message) {
        return new Promise((resolve, reject) => {
            const provider = new ethers.providers.JsonRpcProvider(
                HTTP_RPC_URL,
                BLOCKCHAIN_NETWORK,
            );

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                provider,
            );

            const senderAddress = ethers.utils.getAddress(
                recoverPersonalSignature({ data: message, signature }),
            );

            GobblerOwnerDAO.get({ owner: senderAddress })
                .then((gobblerOwner) => {
                    if (gobblerOwner) {
                        if (!gobblerOwner.mintData) {
                            ETHGobblerNFT.createMintSignature(
                                senderAddress,
                                provider,
                                gobblerOwner,
                                contract,
                            )
                                .then(resolve)
                                .catch(reject);
                        } else {
                            reject("already minted");
                        }
                    } else {
                        reject("not on list");
                    }
                })
                .catch(reject);
        });
    }

    static createMintSignature(
        senderAddress,
        provider,
        gobblerOwner,
        contract,
    ) {
        return new Promise((resolve, reject) => {
            contract.signatureNonce(senderAddress).then((res) => {
                const sigNonce = res._hex;
                const byteArray = utils.toUtf8Bytes("mint");
                const fnNameSig = utils.hexlify(byteArray.slice(0, 4));

                const messageHash = utils.solidityKeccak256(
                    ["address", "address", "bytes4", "uint256"],
                    [senderAddress, CONTRACT_ADDRESS, fnNameSig, sigNonce],
                );
                const SIGNER = new ethers.Wallet(
                    process.env.PRIVATE_KEY,
                    provider,
                );

                SIGNER.signMessage(utils.arrayify(messageHash))
                    .then((signature) => {
                        const mintData = {
                            messageHash,
                            signature,
                        };

                        gobblerOwner.mintData = mintData;
                        GobblerOwnerDAO.save(gobblerOwner).then(() => {
                            resolve(mintData);
                        });
                    })
                    .catch(reject);
            });
        });
    }

    static listen() {
        const provider = new ethers.providers.WebSocketProvider(
            WS_RPC_URL,
            BLOCKCHAIN_NETWORK,
        );

        provider._websocket.on("close", (code) => {
            ETHGobblerNFT.listen();
        });

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        contract.on("Transfer", (from, to, data) => {
            if (to !== BURN_ADDRESS) {
                GobblerOwnerDAO.get({ owner: to })
                    .then((gobblerOwner) => {
                        const tokenID = toInt(data);
                        const tokenData = {
                            tokenID,
                            data,
                        };

                        gobblerOwner.hasMinted = true;
                        gobblerOwner.tokenData = tokenData;
                        GobblerOwnerDAO.save(gobblerOwner).then(() => {
                            const spec = {
                                tokenID: tokenData.tokenID,
                                generation: 1,
                                disposition: gobblerOwner.side,
                            };
                            ETHGobblerDAO.create(spec);
                        });
                    })
                    .catch((error) => {
                        console.log("BURY ERROR");
                    });
            }
        });

        contract.on("Feed", (tokenID, amount, owner) => {
            console.log("Feed -------------------");
            this.__update__({ action: "feed", tokenID, amount, owner });
        });

        contract.on("Groom", (tokenID, amount, owner) => {
            console.log("Groom -------------------");
            this.__update__({ action: "groom", tokenID, amount, owner });
        });

        contract.on("Sleep", (tokenID, owner) => {
            console.log("Sleep -------------------");
            this.__update__({ action: "sleep", tokenID, owner });
        });

        contract.on("Bury", (tokenID, owner) => {
            console.log("Bury -------------------");

            ETHGobblerDAO.get({ tokenID: toInt(tokenID) })
                .then((gobbler) => {
                    gobbler.isAwake = false;
                    gobbler.isBuried = true;
                    gobbler.health = 0;
                    ETHGobblerDAO.save(gobbler);
                })
                .catch((error) => {
                    console.log(`BURY ERROR: ${tokenID}`);
                });

            console.log({ tokenID, owner });
        });

        contract.on("Mitosis", (parentTokenID, newTokenID, owner) => {
            console.log("Mitosis -------------------");
            console.log({ parentTokenID, newTokenID, owner });
        });

        contract.on("ConfigureTraits", (tokenID, traitIDs) => {
            console.log("ConfigureTraits -------------------");
            console.log({ tokenID, traitIDs });

            // const wings = hexZeroPad(hexValue(7), 4);
            // const sidekick = hexZeroPad(hexValue(9), 4);
            // const food = hexZeroPad(hexValue(6895), 4);
            // const accessory = hexZeroPad(hexValue(923), 4);
            // const weather = hexZeroPad(hexValue(3875929), 4);
            // const cushion = hexZeroPad(hexValue(283726), 4);
            // const inflight = hexZeroPad(hexValue(21927), 4);
            // const padding = hexZeroPad(hexValue(0), 4);

            // const traitIDs = hexConcat([
            //     wings,
            //     sidekick,
            //     food,
            //     accessory,
            //     weather,
            //     cushion,
            //     inflight,
            //     padding,
            // ]);
        });

        contract.on(
            "TraitUnlocked",
            (parentGobblerID, newTraitTokenID, owner) => {
                console.log("TraitUnlocked -------------------");
                console.log({ parentGobblerID, newTraitTokenID, owner });
            },
        );

        contract.on(
            "GobblerGobbled",
            (parentGobblerID, victimID, newGobblerGobblerID) => {
                console.log("GobblerGobbled -------------------");
                console.log({ parentGobblerID, victimID, newGobblerGobblerID });
            },
        );
    }

    static __update__(data) {
        ETHGobblerDAO.get({ tokenID: data.tokenID }).then((gobbler) => {
            if (data.action === "feed") {
                gobbler.health += data.amount;
            } else if (data.action === "groom") {
                gobbler.health += data.amount;
            } else if (data.action === "sleep") {
                gobbler.health = 100;
            }

            ETHGobblerDAO.save(gobbler).then(() => {
                console.log(data);
            });
        });
    }

    static age(tokenID) {
        ETHGobblerDAO.get({ tokenID }).then((gobbler) => {
            if (gobbler.health > 0) {
                const deduct = randomInt(HEALTH_DEDUCTION_MAX);
                if (deduct < gobbler.health) {
                    gobbler.health -= deduct;
                } else {
                    gobbler.health = 0;
                }
                ETHGobblerDAO.save(gobbler);
            }
        });
    }

    static async initiateMitosis(tokenID) {
        const provider = new ethers.providers.JsonRpcProvider(
            HTTP_RPC_URL,
            BLOCKCHAIN_NETWORK,
        );

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const res = await contract.ETHGobbled(tokenID);
        const amount = toInt(res);

        if (amount > 0) {
            console.log(`${tokenID}\t${amount}`);
        }
        // ETHGobblerDAO.get({ tokenID }).then((gobbler) => {});
    }
}

export default ETHGobblerNFT;
