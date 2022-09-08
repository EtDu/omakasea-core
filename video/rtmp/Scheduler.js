const { exec } = require("node:child_process");

function execute(command) {
    return new Promise((resolve, reject) => {
        console.log(command);
        const child = exec(command);
        child.stdout.pipe(process.stdout);

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

    static convert(inputPath, outputPath) {
        return execute(
            `./omakasea-core/shell/converter.sh ${inputPath} ${outputPath}`,
        );
    }
}

module.exports = { Scheduler, execute };
