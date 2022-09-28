const { exec } = require("node:child_process");

function execute(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            resolve(stdout);
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
