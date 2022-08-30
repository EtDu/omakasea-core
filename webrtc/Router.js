import { Connector } from "./Connector.js";

const GLOBAL_STATE = {
    rooms: {},
    peers: {},
    transports: [],
    producers: [],
    consumers: [],
};

class Router {
    constructor(connection) {
        this.connection = connection;
        this.connection.on("connection", async (socket) => {
            console.log(socket.id);
            socket.emit("connection-success", {
                socketId: socket.id,
            });

            socket.on("disconnect", () => {
                Connector.disconnect(GLOBAL_STATE, socket);
            });

            socket.on("joinRoom", async ({ roomName }, callback) => {
                await Connector.joinRoom(
                    GLOBAL_STATE,
                    socket,
                    roomName,
                    callback
                );
            });

            socket.on(
                "createWebRtcTransport",
                async ({ consumer }, callback) => {
                    Connector.createWebRtcTransport(
                        GLOBAL_STATE,
                        socket,
                        consumer,
                        callback
                    );
                }
            );

            socket.on("getProducers", (callback) => {
                Connector.getProducers(GLOBAL_STATE, socket, callback);
            });

            socket.on("transport-connect", ({ dtlsParameters }) => {
                Connector.transportConnect(
                    GLOBAL_STATE,
                    socket,
                    dtlsParameters
                );
            });

            socket.on(
                "transport-produce",
                async ({ kind, rtpParameters }, callback) => {
                    await Connector.transportProduce(
                        GLOBAL_STATE,
                        socket,
                        { kind, rtpParameters },
                        callback
                    );
                }
            );

            socket.on(
                "transport-recv-connect",
                async ({ dtlsParameters, serverConsumerTransportId }) => {
                    await Connector.transportRecvConnect(GLOBAL_STATE, {
                        dtlsParameters,
                        serverConsumerTransportId,
                    });
                }
            );

            socket.on(
                "consume",
                async (
                    {
                        rtpCapabilities,
                        remoteProducerId,
                        serverConsumerTransportId,
                    },
                    callback
                ) => {
                    Connector.consume(
                        GLOBAL_STATE,
                        socket,
                        {
                            rtpCapabilities,
                            remoteProducerId,
                            serverConsumerTransportId,
                        },
                        callback
                    );
                }
            );

            socket.on("consumer-resume", async ({ serverConsumerId }) => {
                console.log("consumer resume");
                const { consumer } = GLOBAL_STATE.consumers.find(
                    (consumerData) =>
                        consumerData.consumer.id === serverConsumerId
                );
                await consumer.resume();
            });
        });
    }
}

export { Router };
