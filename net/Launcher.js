import { fork } from "child_process";
import Listener from "../redis/Listener.js";

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

export default Launcher;
