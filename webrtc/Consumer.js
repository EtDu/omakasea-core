class Consumer {
    static addConsumer(globalState, socket, consumer, roomName) {
        globalState.consumers = [
            ...globalState.consumers,
            { socketId: socket.id, consumer, roomName },
        ];

        globalState.peers[socket.id] = {
            ...globalState.peers[socket.id],
            consumers: [...globalState.peers[socket.id].consumers, consumer.id],
        };
    }

    static informConsumers(globalState, roomName, socketId, id) {
        console.log(`just joined, id ${id} ${roomName}, ${socketId}`);

        globalState.producers.forEach((producerData) => {
            if (
                producerData.socketId !== socketId &&
                producerData.roomName === roomName
            ) {
                const producerSocket =
                    globalState.peers[producerData.socketId].socket;

                producerSocket.emit("new-producer", { producerId: id });
            }
        });
    }
}

export { Consumer };
