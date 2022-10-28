import { fork } from "child_process";

class Launcher {
    constructor(script) {
        this.script = script;
    }

    start(data) {
        this.process = fork(this.script);
        this.process.send(data);
    }
}

export default Launcher;
