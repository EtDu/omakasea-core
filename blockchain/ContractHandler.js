import WSSContract from "./WSSContract.js";
import HTTPContract from "./HTTPContract.js";
import { EventEmitter } from "events";
import colors from "colors";

// Create instances of this class to access
class ContractHandler extends EventEmitter {
    constructor() {
        super();
        this.wssContracts = {};
        this.httpContracts = {};
    }

    initWSSContract(name, address, abi, provider) {
        this.wssContracts[name] = new WSSContract(name, address, abi, provider);
        console.log(
            colors.magenta("  WSS CONTRACT ADDED TO HANDLER: %s"),
            name,
        );
    }

    initHTTPContract(name, address, abi, provider) {
        this.httpContracts[name] = new HTTPContract(
            name,
            address,
            abi,
            provider,
        );
        console.log(
            colors.magenta("  HTTP CONTRACT ADDED TO HANDLER: %s"),
            name,
        );
    }
}

export default ContractHandler;
