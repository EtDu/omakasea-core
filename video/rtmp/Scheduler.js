const { exec } = require("node:child_process");

function execute(command) {
    return new Promise((resolve, reject) => {
        const child = exec(command);
        child.on("exit", () => {
            resolve();
        });
    });
}

class Scheduler {
    static play(videoPath, rtmpUrl) {
        return execute(
            `./omakasea-core/shell/player.sh ${videoPath} ${rtmpUrl}`,
        );
    }

    static transmux(inputPath, outputPath) {
        return execute(
            `./omakasea-core/shell/player.sh ${videoPath} ${rtmpUrl}`,
        );
    }
}

module.exports = Scheduler;
