import dotenv from "dotenv";
dotenv.config();

import utils from "ethers/lib/utils.js";
import ethers from "ethers";

import { ABI } from "../../../blockchain/EthGobblersABI.js";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;

const PROVIDER = new ethers.providers.JsonRpcProvider(
    RPC_URL,
    BLOCKCHAIN_NETWORK,
);

class SignGobbler {
    static sign(fnName, senderAddress) {
        return new Promise((resolve, reject) => {
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                PROVIDER,
            );

            contract.signatureNonce(senderAddress).then((res) => {
                const sigNonce = res._hex;
                const fnNameSig = Number(
                    utils.keccak256(utils.toUtf8Bytes(fnName)).substring(0, 10),
                );

                contract
                    .hashMessage(
                        senderAddress,
                        CONTRACT_ADDRESS,
                        fnNameSig,
                        sigNonce,
                    )
                    .then((messageHash) => {
                        const SIGNER = new ethers.Wallet(
                            process.env.PRIVATE_KEY,
                            PROVIDER,
                        );
                        SIGNER.signMessage(messageHash).then((signature) => {
                            resolve(signature);
                        });
                    });
            });
        });
    }
}

export default SignGobbler;
