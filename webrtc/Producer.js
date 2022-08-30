import { WORKER } from "./Worker.js";

const MEDIA_CODECS = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
            "x-google-start-bitrate": 1000,
        },
    },
];

class Producer {
    static addProducer(globalState, socket, producer, roomName) {
        globalState.producers = [
            ...globalState.producers,
            { socketId: socket.id, producer, roomName },
        ];

        globalState.peers[socket.id] = {
            ...globalState.peers[socket.id],
            producers: [...globalState.peers[socket.id].producers, producer.id],
        };
    }

    static async createRoom(globalState, roomName, socketId) {
        let router1;
        let peers = [];
        if (globalState.rooms[roomName]) {
            router1 = globalState.rooms[roomName].router;
            peers = globalState.rooms[roomName].peers || [];
        } else {
            router1 = await WORKER.createRouter({ mediaCodecs: MEDIA_CODECS });
        }

        console.log(`Router ID: ${router1.id}`, peers.length);

        globalState.rooms[roomName] = {
            router: router1,
            peers: [...peers, socketId],
        };

        return router1;
    }
}

export { Producer };
