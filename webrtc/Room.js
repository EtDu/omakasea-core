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

function removeItems(socket, items, type) {
    items.forEach((item) => {
        if (item.socketId === socket.id) {
            item[type].close();
        }
    });
    items = items.filter((item) => item.socketId !== socket.id);

    return items;
}

class Room {
    static disconnect(globalState, socket) {
        console.log("peer disconnected");
        globalState.consumers = removeItems(
            socket,
            globalState.consumers,
            "consumer"
        );
        globalState.producers = removeItems(
            socket,
            globalState.producers,
            "producer"
        );
        globalState.transports = removeItems(
            socket,
            globalState.transports,
            "transport"
        );

        const { roomName } = globalState.peers[socket.id];
        delete globalState.peers[socket.id];

        globalState.rooms[roomName] = {
            router: globalState.rooms[roomName].router,
            peers: globalState.rooms[roomName].peers.filter(
                (socketId) => socketId !== socket.id
            ),
        };
    }

    static async create(globalState, roomName, socketId) {
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

    static async join(globalState, socket, roomName, callback) {
        const router1 = await Room.create(globalState, roomName, socket.id);

        globalState.peers[socket.id] = {
            socket,
            roomName,
            transports: [],
            producers: [],
            consumers: [],
            peerDetails: {
                name: "",
                isAdmin: false,
            },
        };

        const rtpCapabilities = router1.rtpCapabilities;

        callback({ rtpCapabilities });
    }
}

export { Room };
