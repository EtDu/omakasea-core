class Transport {
    static getTransport(globalState, socketId) {
        const [producerTransport] = globalState.transports.filter(
            (transport) =>
                transport.socketId === socketId && !transport.consumer
        );
        return producerTransport.transport;
    }

    static async createWebRtcTransport(router) {
        return new Promise(async (resolve, reject) => {
            try {
                const webRtcTransport_options = {
                    listenIps: [
                        {
                            ip: "192.168.86.102",
                            announcedIp: "192.168.86.102",
                        },
                    ],
                    enableUdp: true,
                    enableTcp: true,
                    preferUdp: true,
                };

                let transport = await router.createWebRtcTransport(
                    webRtcTransport_options
                );
                console.log(`transport id: ${transport.id}`);

                transport.on("dtlsstatechange", (dtlsState) => {
                    if (dtlsState === "closed") {
                        transport.close();
                    }
                });

                transport.on("close", () => {
                    console.log("transport closed");
                });

                resolve(transport);
            } catch (error) {
                reject(error);
            }
        });
    }

    static addTransport(globalState, socket, transport, roomName, consumer) {
        globalState.transports = [
            ...globalState.transports,
            { socketId: socket.id, transport, roomName, consumer },
        ];

        globalState.peers[socket.id] = {
            ...globalState.peers[socket.id],
            transports: [
                ...globalState.peers[socket.id].transports,
                transport.id,
            ],
        };
    }
}

export { Transport };
