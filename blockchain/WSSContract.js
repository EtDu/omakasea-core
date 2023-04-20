import ethers from "ethers";
import colors from "colors";
import { EventEmitter } from "events";

class WSSContract extends EventEmitter {
    constructor(name, contractAddress, abi, provider) {
        super();
        if (!provider.ready) throw new Error("Provider is not ready");

        this.name = name;
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.provider = provider.provider;
        this.contract = new ethers.Contract(
            contractAddress,
            abi,
            provider.provider,
        );

        this.emit("setContract");

        console.log(colors.magenta("  WSS CONTRACT SET: %s"), name);
    }
}

export default WSSContract;
