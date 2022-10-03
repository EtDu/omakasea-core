const process = require("process");
const { fork } = require("child_process");
const Listener = require("../redis/Listener");

class Launcher {
    constructor(channel, target) {
        console.log(`LAUNCHER CREATED : ${channel}`);
        this.listener = new Listener();
        this.listener.listen(channel, (data) => {
            const builder = fork(target);
            builder.send(data);
        });
    }
}

module.exports = Launcher;
