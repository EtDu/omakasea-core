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
    static disconnect(data, socket) {
        console.log("peer disconnected");
        data.consumers = removeItems(socket, data.consumers, "consumer");
        data.producers = removeItems(socket, data.producers, "producer");
        data.transports = removeItems(socket, data.transports, "transport");

        const { roomName } = data.peers[socket.id];
        delete data.peers[socket.id];

        data.rooms[roomName] = {
            router: data.rooms[roomName].router,
            peers: data.rooms[roomName].peers.filter(
                (socketId) => socketId !== socket.id
            ),
        };
    }

    static async joinRoom(data, socket, roomName, callback) {
        const router1 = await Producer.createRoom(data, roomName, socket.id);

        data.peers[socket.id] = {
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

    static createWebRtcTransport(data, socket, consumer, callback) {
        const roomName = data.peers[socket.id].roomName;
        const router = data.rooms[roomName].router;
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
                    data,
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

    static getProducers(data, socket, callback) {
        const { roomName } = data.peers[socket.id];

        let producerList = [];
        data.producers.forEach((producerData) => {
            if (
                producerData.socketId !== socket.id &&
                producerData.roomName === roomName
            ) {
                producerList = [...producerList, producerData.producer.id];
            }
        });

        callback(producerList);
    }

    static transportConnect(data, socket, dtlsParameters) {
        console.log("DTLS PARAMS... ", { dtlsParameters });
        Transport.getTransport(data, socket.id).connect({ dtlsParameters });
    }

    static async transportProduce(
        data,
        socket,
        { kind, rtpParameters },
        callback
    ) {
        const producer = await Transport.getTransport(data, socket.id).produce({
            kind,
            rtpParameters,
        });

        const { roomName } = data.peers[socket.id];

        Producer.addProducer(data, socket, producer, roomName);
        Consumer.informConsumers(data, roomName, socket.id, producer.id);

        console.log("Producer ID: ", producer.id, producer.kind);

        producer.on("transportclose", () => {
            console.log("transport for this producer closed ");
            producer.close();
        });

        callback({
            id: producer.id,
            producersExist: data.producers.length > 1 ? true : false,
        });
    }

    static async transportRecvConnect(
        data,
        { dtlsParameters, serverConsumerTransportId }
    ) {
        console.log(`DTLS PARAMS: ${dtlsParameters}`);
        const consumerTransport = data.transports.find(
            (transportData) =>
                transportData.consumer &&
                transportData.transport.id == serverConsumerTransportId
        ).transport;
        await consumerTransport.connect({ dtlsParameters });
    }

    static async consume(
        data,
        socket,
        { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
        callback
    ) {
        try {
            const { roomName } = data.peers[socket.id];
            const router = data.rooms[roomName].router;
            let consumerTransport = data.transports.find(
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
                    data.transports = data.transports.filter(
                        (transportData) =>
                            transportData.transport.id !== consumerTransport.id
                    );
                    consumer.close();
                    data.consumers = data.consumers.filter(
                        (consumerData) =>
                            consumerData.consumer.id !== consumer.id
                    );
                });

                Consumer.addConsumer(data, socket, consumer, roomName);
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
