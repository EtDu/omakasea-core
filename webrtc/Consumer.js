class Consumer {
    static addConsumer(data, socket, consumer, roomName) {
        data.consumers = [
            ...data.consumers,
            { socketId: socket.id, consumer, roomName },
        ];

        data.peers[socket.id] = {
            ...data.peers[socket.id],
            consumers: [...data.peers[socket.id].consumers, consumer.id],
        };
    }

    static informConsumers(data, roomName, socketId, id) {
        console.log(`just joined, id ${id} ${roomName}, ${socketId}`);

        data.producers.forEach((producerData) => {
            if (
                producerData.socketId !== socketId &&
                producerData.roomName === roomName
            ) {
                const producerSocket = data.peers[producerData.socketId].socket;

                producerSocket.emit("new-producer", { producerId: id });
            }
        });
    }
}

export { Consumer };
