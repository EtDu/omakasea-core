import dotenv from "dotenv";
dotenv.config();

import utils from "ethers/lib/utils.js";
import ethers from "ethers";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import { ABI } from "../../../blockchain/EthGobblersABI.js";

import GobblerOwnerDAO from "../data/mongo/dao/GobblerOwnerDAO.js";

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const HTTP_RPC_URL = process.env.HTTP_RPC_URL;
const WS_RPC_URL = process.env.WS_RPC_URL;

class ETHGobblerNFT {
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
                            resolve(gobblerOwner.mintData);
                        }
                    } else {
                        reject();
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

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        contract.on("Transfer", (from, to, value, event) => {
            let info = {
                from: from,
                to: to,
                value: ethers.utils.formatUnits(value, 6),
                data: event,
            };
        });

        provider._websocket.on("close", (code) => {
            ETHGobblerNFT.listen();
        });
    }
}

export default ETHGobblerNFT;
