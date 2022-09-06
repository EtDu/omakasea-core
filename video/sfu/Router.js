import Room from "./Room.js";
import Producer from "./Producer.js";
import Consumer from "./Consumer.js";
import Transport from "./Transport.js";

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
        Room.disconnect(GLOBAL_STATE, socket);
      });

      socket.on("joinRoom", async ({ roomName }, callback) => {
        await Room.join(GLOBAL_STATE, socket, roomName, callback);
      });

      socket.on("createWebRtcTransport", async ({ consumer }, callback) => {
        Transport.create(GLOBAL_STATE, socket, consumer, callback);
      });

      socket.on("getProducers", (callback) => {
        Producer.get(GLOBAL_STATE, socket, callback);
      });

      socket.on("transport-connect", ({ dtlsParameters }) => {
        Transport.connect(GLOBAL_STATE, socket, dtlsParameters);
      });

      socket.on(
        "transport-produce",
        async ({ kind, rtpParameters }, callback) => {
          await Transport.produce(
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
          await Transport.receive(GLOBAL_STATE, {
            dtlsParameters,
            serverConsumerTransportId,
          });
        }
      );

      socket.on(
        "consume",
        async (
          { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
          callback
        ) => {
          Consumer.consume(
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
          (consumerData) => consumerData.consumer.id === serverConsumerId
        );
        await consumer.resume();
      });
    });
  }
}

export default Router;
