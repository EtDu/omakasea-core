class Consumer {
  static add(globalState, socket, consumer, roomName) {
    globalState.consumers = [
      ...globalState.consumers,
      { socketId: socket.id, consumer, roomName },
    ];

    globalState.peers[socket.id] = {
      ...globalState.peers[socket.id],
      consumers: [...globalState.peers[socket.id].consumers, consumer.id],
    };
  }

  static inform(globalState, roomName, socketId, id) {
    console.log(`just joined, id ${id} ${roomName}, ${socketId}`);

    globalState.producers.forEach((producerData) => {
      if (
        producerData.socketId !== socketId &&
        producerData.roomName === roomName
      ) {
        const producerSocket = globalState.peers[producerData.socketId].socket;

        producerSocket.emit("new-producer", { producerId: id });
      }
    });
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
            (consumerData) => consumerData.consumer.id !== consumer.id
          );
        });

        Consumer.add(globalState, socket, consumer, roomName);
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

export default Consumer;
