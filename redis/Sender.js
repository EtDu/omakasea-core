import RedisClient from "./Client.js";

class Sender {
    constructor() {
        this.sender = RedisClient.create();
        this.sender.connect();
    }

    to(toChannel, data) {
        return this.sender.publish(toChannel, JSON.stringify(data));
    }

    close() {
        this.sender.quit();
    }
}

export default Sender;
