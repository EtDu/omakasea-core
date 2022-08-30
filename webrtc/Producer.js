class Producer {
    static add(globalState, socket, producer, roomName) {
        globalState.producers = [
            ...globalState.producers,
            { socketId: socket.id, producer, roomName },
        ];

        globalState.peers[socket.id] = {
            ...globalState.peers[socket.id],
            producers: [...globalState.peers[socket.id].producers, producer.id],
        };
    }

    static get(globalState, socket, callback) {
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
}

export { Producer };
