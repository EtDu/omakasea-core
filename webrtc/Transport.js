import Consumer from "./Consumer.js";
import Producer from "./Producer.js";

const HOST_URL = "192.168.86.102";

class Transport {
  static get(globalState, socketId) {
    const [producerTransport] = globalState.transports.filter(
      (transport) => transport.socketId === socketId && !transport.consumer
    );
    return producerTransport.transport;
  }

  static connect(globalState, socket, dtlsParameters) {
    console.log("DTLS PARAMS... ", { dtlsParameters });
    Transport.get(globalState, socket.id).connect({
      dtlsParameters,
    });
  }

  static create(globalState, socket, consumer, callback) {
    const roomName = globalState.peers[socket.id].roomName;
    const router = globalState.rooms[roomName].router;
    Transport.init(router).then(
      (transport) => {
        callback({
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          },
        });

        Transport.add(globalState, socket, transport, roomName, consumer);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  static async init(router) {
    return new Promise(async (resolve, reject) => {
      try {
        const transportOptions = {
          listenIps: [
            {
              ip: HOST_URL,
              announcedIp: HOST_URL,
            },
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        };

        let transport = await router.createWebRtcTransport(transportOptions);
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

  static add(globalState, socket, transport, roomName, consumer) {
    globalState.transports = [
      ...globalState.transports,
      { socketId: socket.id, transport, roomName, consumer },
    ];

    globalState.peers[socket.id] = {
      ...globalState.peers[socket.id],
      transports: [...globalState.peers[socket.id].transports, transport.id],
    };
  }

  static async produce(globalState, socket, { kind, rtpParameters }, callback) {
    const producer = await Transport.get(globalState, socket.id).produce({
      kind,
      rtpParameters,
    });

    const { roomName } = globalState.peers[socket.id];

    Producer.add(globalState, socket, producer, roomName);
    Consumer.inform(globalState, roomName, socket.id, producer.id);

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

  static async receive(
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
}

export default Transport;
