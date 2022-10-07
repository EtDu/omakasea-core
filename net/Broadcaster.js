import Sender from "../redis/Sender.js";

class Broadcaster {
    static create(channel) {
        console.log("BROADCASTER CREATED");
        const BROADCASTER = new Broadcaster(channel);
        Object.freeze(BROADCASTER);
        return BROADCASTER;
    }

    constructor(channel) {
        this.channel = channel;
        this.sender = new Sender();
    }

    send(data) {
        this.sender.to(this.channel, data);
    }
}

export default Broadcaster;
