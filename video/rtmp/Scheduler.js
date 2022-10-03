const ffmpeg = require("fluent-ffmpeg");

class Scheduler {
    static timeSig(duration) {
        const sec_num = parseInt(duration, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ":" + minutes + ":" + seconds;
    }

    static play(videoPath, rtmpUrl) {
        return new Promise((resolve, reject) => {
            const __PLAYER__ = new ffmpeg({
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
                .on("error", (error) => {
                    console.log("=========");
                    console.log(error);
                    console.log("=========");
                    reject();
                })
                .output(rtmpUrl, (stdout, stderr) => {
                    console.log("Convert complete" + stdout);
                })
                .run();
        });
    }

    static convert(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const __CONVERTER__ = new ffmpeg({
                    source: inputPath,
                    timeout: 0,
                })
                    .addOption("-c:a", "copy")
                    .addOption("-crf", 20)
                    .addOption("-preset", "slow")
                    .addOption("-hls_list_size", 1)
                    .on("start", (command) => {
                        console.log(command);
                    })
                    .on("end", (stdout) => {
                        try {
                            ffmpeg(outputPath).ffprobe((err, data) => {
                                resolve(data.streams[0].duration);
                            });
                        } catch (error) {
                            console.log("=========");
                            console.log(error);
                            console.log("=========");
                            reject();
                        }
                    })
                    .on("error", (error) => {
                        console.log("=========");
                        console.log(error);
                        console.log("=========");
                        reject();
                    })
                    .output(outputPath, (stdout, stderr) => {
                        console.log("Convert complete" + stdout);
                    })
                    .run();
            } catch (error) {
                console.log("=========");
                console.log(error);
                console.log("=========");
                reject();
            }
        });
    }
}

module.exports = Scheduler;
