const redis = require("redis");

class Client {
    static create() {
        const client = redis.createClient({ url: process.env.REDIS_URL });
        client.on("error", (error) => {
            console.error(error);
        });
        return client;
    }
}

module.exports = Client;
