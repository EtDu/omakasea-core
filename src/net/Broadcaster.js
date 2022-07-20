const Sender = require("../redis/Sender");

class Broadcaster {
    static create() {
        console.log("BROADCASTER CREATED");
        const BROADCASTER = new Broadcaster();
        Object.freeze(BROADCASTER);
        return BROADCASTER;
    }

    constructor() {
        this.sender = new Sender();
    }

    send(data) {
        this.sender.to(process.env.NFT_QUEUE, data);
    }
}

module.exports = Broadcaster.create();
