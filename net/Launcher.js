const process = require("process");
const { fork } = require("child_process");
const Listener = require("../redis/Listener");

class Launcher {
  constructor(builderPath) {
    console.log("LAUNCHER CREATED");
    this.listener = new Listener();
    this.listener.listen(process.env.NFT_QUEUE, (data) => {
      const builder = fork(builderPath);
      builder.send(data);
    });
  }
}

module.exports = Launcher;
