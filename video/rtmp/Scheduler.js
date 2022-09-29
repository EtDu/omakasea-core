const { exec } = require("node:child_process");
const ffmpeg = require("fluent-ffmpeg");

function execute(command) {
    console.log(command);
    return new Promise((resolve, reject) => {
        const proc = exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
}

class Scheduler {
    static play(videoPath, rtmpUrl) {
        return new Promise((resolve, reject) => {
            const proc3 = new ffmpeg({
                source: videoPath,
                timeout: 0,
            })
                .native()
                .addOption("-c:v", "libx264")
                .addOption("-preset", "veryfast")
                .addOption("-tune", "zerolatency")
                .addOption("-c:a", "aac")
                .addOption("-ar", "44100")
                .addOption("-f", "flv")
                .on("start", (command) => {
                    console.log(command);
                })
                .on("end", () => {
                    resolve();
                })
                .output(rtmpUrl, (stdout, stderr) => {
                    console.log("Convert complete" + stdout);
                })
                .run();
        });
    }

    static convert(inputPath, outputPath) {
        return execute(
            `./omakasea-core/shell/converter.sh ${inputPath} ${outputPath}`,
        );
    }
}

module.exports = { Scheduler, execute };
