const RedisClient = require("./Client");

class Listener {
    constructor() {
        this.listeners = {};
    }

    listen(toChannel, resolve = null) {
        if (resolve !== null) {
            if (this.listeners[toChannel] === undefined) {
                this.listeners[toChannel] = RedisClient.create();
                this.listeners[toChannel].connect();
                this.listeners[toChannel].subscribe(toChannel, (data) => {
                    if (resolve !== null) {
                        resolve(JSON.parse(data));
                    }
                });
            }
        }
    }

    close() {
        for (let key of Object.keys(this.listeners)) {
            this.listeners[key].unsubscribe();
            this.listeners[key].quit();
        }
    }
}

module.exports = Listener;
