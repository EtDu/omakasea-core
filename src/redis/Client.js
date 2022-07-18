const redis = require("redis");

class Client {
    static create() {
        const client = redis.createClient();
        client.on("error", (error) => {
            console.error(error);
        });
        return client;
    }
}

module.exports = Client;
