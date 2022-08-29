import mediasoup from "mediasoup";
import { mediaCodecs } from "./constants.js";

class Producer {
    static addProducer(data, socket, producer, roomName) {
        data.producers = [
            ...data.producers,
            { socketId: socket.id, producer, roomName },
        ];

        data.peers[socket.id] = {
            ...data.peers[socket.id],
            producers: [...data.peers[socket.id].producers, producer.id],
        };
    }

    static async createRoom(data, roomName, socketId) {
        let router1;
        let peers = [];
        if (data.rooms[roomName]) {
            router1 = data.rooms[roomName].router;
            peers = data.rooms[roomName].peers || [];
        } else {
            router1 = await WORKER.createRouter({ mediaCodecs });
        }

        console.log(`Router ID: ${router1.id}`, peers.length);

        data.rooms[roomName] = {
            router: router1,
            peers: [...peers, socketId],
        };

        return router1;
    }
}

class Worker {
    static async createWorker() {
        const worker = await mediasoup.createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 2020,
        });
        console.log(`worker pid ${worker.pid}`);

        worker.on("died", (error) => {
            console.error("mediasoup worker has died");
            setTimeout(() => process.exit(1), 2000);
        });

        return worker;
    }
}

let WORKER;
(async () => {
    WORKER = await Worker.createWorker();
    Object.freeze(WORKER);
})();

export { Producer };
