import dotenv from "dotenv";
dotenv.config();

import utils from "ethers/lib/utils.js";
import ethers from "ethers";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import { ABI } from "../../../blockchain/EthGobblersABI.js";

import GobblerOwnerDAO from "../data/mongo/dao/GobblerOwnerDAO.js";
import ETHGobblerDAO from "../data/mongo/dao/ETHGobblerDAO.js";
import ETHGobblerActionDAO from "../data/mongo/dao/ETHGobblerActionDAO.js";
import ETHGobblerTraitDAO from "../data/mongo/dao/ETHGobblerTraitDAO.js";

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const BURN_ADDRESS = process.env.BURN_ADDRESS;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const HTTP_RPC_URL = process.env.HTTP_RPC_URL;
const WS_RPC_URL = process.env.WS_RPC_URL;
const HEALTH_DEDUCTION_MAX = process.env.HEALTH_DEDUCTION_MAX;

const GROOM_INCREASE = 45;
const TRAIT_UNLOCK_MINIMUM = 0.05;

function toInt(hex) {
    return Number(ethers.utils.formatUnits(hex, 0));
}

function randomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

function getAction(index) {
    if (index === 0) {
        return "feed";
    } else if (index === 1) {
        return "groom";
    } else if (index === 2) {
        return "sleep";
    }
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

    static getActionSignature(payload) {
        return new Promise((resolve, reject) => {
            const { fnName, signature, message, tokenID } = payload;

            const provider = new ethers.providers.JsonRpcProvider(
                HTTP_RPC_URL,
                BLOCKCHAIN_NETWORK,
            );

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                provider,
            );

            const owner = ethers.utils.getAddress(
                recoverPersonalSignature({ data: message, signature }),
            );

            contract.ownerOf(tokenID).then((address) => {
                if (address === owner) {
                    ETHGobblerActionDAO.get({
                        tokenID,
                        fnName,
                        owner,
                        ackState: 0,
                    }).then((gobblerAction) => {
                        if (gobblerAction === null) {
                            const action = {
                                tokenID,
                                fnName,
                                owner,
                            };
                            this.createActionSignature(
                                provider,
                                contract,
                                owner,
                                action,
                            )
                                .then((sig) => {
                                    action.sig = sig;
                                    ETHGobblerActionDAO.create(action).then(
                                        () => {
                                            resolve(sig);
                                        },
                                    );
                                })
                                .catch(reject);
                        } else {
                            resolve(gobblerAction.sig);
                        }
                    });
                } else {
                    reject();
                }
            });
        });
    }

    static createActionSignature(provider, contract, owner, action) {
        return new Promise((resolve, reject) => {
            contract.signatureNonce(owner).then((res) => {
                const sigNonce = res._hex;
                const byteArray = utils.toUtf8Bytes(action.fnName);
                const fnNameSig = utils.hexlify(byteArray.slice(0, 4));

                const messageHash = utils.solidityKeccak256(
                    ["address", "address", "bytes4", "uint256"],
                    [owner, CONTRACT_ADDRESS, fnNameSig, sigNonce],
                );
                const SIGNER = new ethers.Wallet(
                    process.env.PRIVATE_KEY,
                    provider,
                );

                SIGNER.signMessage(utils.arrayify(messageHash))
                    .then((signature) => {
                        resolve({ signature, messageHash });
                    })
                    .catch(reject);
            });
        });
    }

    static getTestMint(signature, message) {
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
                        resolve(mintData);
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

            ETHGobblerNFT.createMintSignature(
                senderAddress,
                provider,
                gobblerOwner,
                contract,
            )
                .then(resolve)
                .catch(reject);

            // GobblerOwnerDAO.get({ owner: senderAddress })
            //     .then((gobblerOwner) => {
            //         if (!gobblerOwner.hasMinted) {
            //             if (!gobblerOwner.mintData) {
            //             } else {
            //                 resolve(gobblerOwner.mintData);
            //             }
            //         } else {
            //             reject("already minted");
            //         }
            //     })
            //     .catch(() => reject("not on list"));
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
            if (to !== BURN_ADDRESS && from == ZERO_ADDRESS) {
                const tokenID = toInt(data);
                const spec = {
                    tokenID: tokenID,
                    generation: 1,
                    disposition: "nice",
                };
                ETHGobblerDAO.create(spec);

                // GobblerOwnerDAO.get({ owner: to })
                //     .then((gobblerOwner) => {
                //         const tokenData = {
                //             tokenID,
                //             data,
                //         };

                //         gobblerOwner.hasMinted = true;
                //         gobblerOwner.tokenData = tokenData;
                //         GobblerOwnerDAO.save(gobblerOwner).then(() => {
                //         });
                //     })
                //     .catch((error) => {
                //         console.log("BURY ERROR");
                //     });
            }
        });

        contract.on("Feed", (token, amount, owner) => {
            console.log("Feed -------------------");
            this.__updateAction__({ action: "feed", token, amount, owner });
        });

        contract.on("Groom", (token, amount, owner) => {
            console.log("Groom -------------------");
            this.__updateAction__({ action: "groom", token, amount, owner });
        });

        contract.on("Sleep", (token, owner) => {
            console.log("Sleep -------------------");
            this.__updateAction__({ action: "sleep", token, owner });
        });

        contract.on("Bury", (token, owner) => {
            console.log("Bury -------------------");
            const tokenID = toInt(token);
            ETHGobblerDAO.get({ tokenID })
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

    static __updateAction__(data) {
        const tokenID = toInt(data.token);
        const query = {
            tokenID,
            fnName: "actionAlive",
            owner: data.owner,
            ackState: 0,
            actionName: null,
        };

        ETHGobblerActionDAO.get(query).then((action) => {
            if (action) {
                action.actionName = data.action;
                action.ackState = 2;
                action.amount = data.amount ? data.amount : 0;
                ETHGobblerActionDAO.save(action).then(() => {
                    ETHGobblerDAO.get({ tokenID }).then((gobbler) => {
                        if (gobbler) {
                            if (data.action === "feed") {
                                gobbler.health += data.amount;
                            } else if (data.action === "groom") {
                                if (gobbler.health + GROOM_INCREASE < 100) {
                                    gobbler.health += GROOM_INCREASE;
                                } else {
                                    gobbler.health = 100;
                                }
                            } else if (data.action === "sleep") {
                                gobbler.health = 100;
                            }

                            ETHGobblerDAO.save(gobbler).then(() => {
                                ETHGobblerNFT.__updateUnlock__(tokenID);
                            });
                        } else {
                            console.log(data);
                        }
                    });
                });
            }
        });
    }

    static __updateUnlock__(tokenID) {
        const provider = new ethers.providers.JsonRpcProvider(
            HTTP_RPC_URL,
            BLOCKCHAIN_NETWORK,
        );

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        contract.ETHGobbled(tokenID).then((wei) => {
            ETHGobblerTraitDAO.search({ tokenID }).then((results) => {
                const totalUnlocks = Math.floor(
                    ethers.utils.formatEther(wei) / TRAIT_UNLOCK_MINIMUM,
                );

                const unlocks = totalUnlocks - results.length;
                for (let i = 0; i < unlocks; i++) {
                    ETHGobblerTraitDAO.create({
                        gobblerID: tokenID,
                    });
                }
            });
        });
    }

    static inbox(payload) {
        return new Promise((resolve, reject) => {
            const { message, signature, tokenID } = payload;

            const provider = new ethers.providers.JsonRpcProvider(
                HTTP_RPC_URL,
                BLOCKCHAIN_NETWORK,
            );

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                provider,
            );

            const owner = ethers.utils.getAddress(
                recoverPersonalSignature({ data: message, signature }),
            );

            contract.ownerOf(tokenID).then((address) => {
                if (address === owner) {
                    ETHGobblerTraitDAO.search({ gobblerID: tokenID })
                        .then((results) => {
                            let unlocked = 0;
                            for (const row of results) {
                                if (row.traitID === null) {
                                    unlocked++;
                                }
                            }
                            resolve({ unlocked });
                        })
                        .catch(reject);
                }
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
            console.log(res);
            console.log(`${tokenID}\t${amount}`);
            console.log("====================");
        }
        // ETHGobblerDAO.get({ tokenID }).then((gobbler) => {});
    }
}

export default ETHGobblerNFT;
