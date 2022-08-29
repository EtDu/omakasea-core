import { Consumer } from "./Consumer.js";
import { Producer } from "./Producer.js";
import { Transport } from "./Transport.js";

function removeItems(socket, items, type) {
    items.forEach((item) => {
        if (item.socketId === socket.id) {
            item[type].close();
        }
    });
    items = items.filter((item) => item.socketId !== socket.id);

    return items;
}

class Connector {
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

    static async joinRoom(globalState, socket, roomName, callback) {
        const router1 = await Producer.createRoom(
            globalState,
            roomName,
            socket.id
        );

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

    static createWebRtcTransport(globalState, socket, consumer, callback) {
        const roomName = globalState.peers[socket.id].roomName;
        const router = globalState.rooms[roomName].router;
        Transport.createWebRtcTransport(router).then(
            (transport) => {
                callback({
                    params: {
                        id: transport.id,
                        iceParameters: transport.iceParameters,
                        iceCandidates: transport.iceCandidates,
                        dtlsParameters: transport.dtlsParameters,
                    },
                });

                Transport.addTransport(
                    globalState,
                    socket,
                    transport,
                    roomName,
                    consumer
                );
            },
            (error) => {
                console.log(error);
            }
        );
    }

    static getProducers(globalState, socket, callback) {
        const { roomName } = globalState.peers[socket.id];

        let producerList = [];
        globalState.producers.forEach((producerData) => {
            if (
                producerData.socketId !== socket.id &&
                producerData.roomName === roomName
            ) {
                producerList = [...producerList, producerData.producer.id];
            }
        });

        callback(producerList);
    }

    static transportConnect(globalState, socket, dtlsParameters) {
        console.log("DTLS PARAMS... ", { dtlsParameters });
        Transport.getTransport(globalState, socket.id).connect({
            dtlsParameters,
        });
    }

    static async transportProduce(
        globalState,
        socket,
        { kind, rtpParameters },
        callback
    ) {
        const producer = await Transport.getTransport(
            globalState,
            socket.id
        ).produce({
            kind,
            rtpParameters,
        });

        const { roomName } = globalState.peers[socket.id];

        Producer.addProducer(globalState, socket, producer, roomName);
        Consumer.informConsumers(globalState, roomName, socket.id, producer.id);

        console.log("Producer ID: ", producer.id, producer.kind);

        producer.on("transportclose", () => {
            console.log("transport for this producer closed ");
            producer.close();
        });

        callback({
            id: producer.id,
            producersExist: globalState.producers.length > 1 ? true : false,
        });
    }

    static async transportRecvConnect(
        globalState,
        { dtlsParameters, serverConsumerTransportId }
    ) {
        console.log(`DTLS PARAMS: ${dtlsParameters}`);
        const consumerTransport = globalState.transports.find(
            (transportData) =>
                transportData.consumer &&
                transportData.transport.id == serverConsumerTransportId
        ).transport;
        await consumerTransport.connect({ dtlsParameters });
    }

    static async consume(
        globalState,
        socket,
        { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
        callback
    ) {
        try {
            const { roomName } = globalState.peers[socket.id];
            const router = globalState.rooms[roomName].router;
            let consumerTransport = globalState.transports.find(
                (transportData) =>
                    transportData.consumer &&
                    transportData.transport.id == serverConsumerTransportId
            ).transport;

            if (
                router.canConsume({
                    producerId: remoteProducerId,
                    rtpCapabilities,
                })
            ) {
                const consumer = await consumerTransport.consume({
                    producerId: remoteProducerId,
                    rtpCapabilities,
                    paused: true,
                });

                consumer.on("transportclose", () => {
                    console.log("transport close from consumer");
                });

                consumer.on("producerclose", () => {
                    console.log("producer of consumer closed");
                    socket.emit("producer-closed", { remoteProducerId });

                    consumerTransport.close([]);
                    globalState.transports = globalState.transports.filter(
                        (transportData) =>
                            transportData.transport.id !== consumerTransport.id
                    );
                    consumer.close();
                    globalState.consumers = globalState.consumers.filter(
                        (consumerData) =>
                            consumerData.consumer.id !== consumer.id
                    );
                });

                Consumer.addConsumer(globalState, socket, consumer, roomName);
                const params = {
                    id: consumer.id,
                    producerId: remoteProducerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    serverConsumerId: consumer.id,
                };

                callback({ params });
            }
        } catch (error) {
            console.log(error.message);
            callback({
                params: {
                    error: error,
                },
            });
        }
    }
}

export { Connector };
