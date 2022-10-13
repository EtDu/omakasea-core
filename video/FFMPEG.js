import ffmpeg from "fluent-ffmpeg";

class FFMPEG {
    static getResolution(inputPath) {
        return new Promise((resolve, reject) => {
            FFMPEG.getInfo(inputPath)
                .then((data) => {
                    resolve(FFMPEG.resolutionSig(data));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    static getInfo(inputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath).ffprobe((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    static getDuration(inputPath) {
        return new Promise((resolve, reject) => {
            FFMPEG.getInfo(inputPath)
                .then((data) => {
                    resolve(FFMPEG.timeSig(data));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static formatDuration(d) {
        let hours;
        let minutes;
        let seconds;

        if (d.hours < 10) {
            hours = "0" + d.hours;
        }
        if (d.minutes < 10) {
            minutes = "0" + d.minutes;
        }
        if (d.seconds < 10) {
            seconds = "0" + d.seconds;
        }

        return hours + ":" + minutes + ":" + seconds;
    }

    static resolutionSig(data) {
        return {
            width: data.streams[0].width,
            height: data.streams[0].height,
        };
    }

    static timeSig(data) {
        const d = data.streams[0].duration;
        const sec_num = parseInt(d, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;
        return { hours, minutes, seconds };
    }

    static trim(options) {
        const { inputPath, outputPath, startsAt, endsAt } = options;
        return new Promise((resolve, reject) => {
            try {
                const __CONVERTER__ = new ffmpeg({
                    source: inputPath,
                    timeout: 0,
                })
                    .addOption("-ss", startsAt)
                    .addOption("-to", endsAt)
                    // .addOption("-c", "copy")
                    .addOption("-vf", "scale=1920x1080:flags=lanczos")
                    .on("start", (command) => {
                        console.log(command);
                    })
                    .on("end", (stdout) => {
                        try {
                            FFMPEG.getInfo(outputPath)
                                .then((data) => {
                                    resolve({
                                        time: FFMPEG.timeSig(data),
                                        resolution: FFMPEG.resolutionSig(data),
                                    });
                                })
                                .catch((error) => {
                                    console.log("=========");
                                    console.log(error);
                                    console.log("=========");
                                    reject(error);
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
                            FFMPEG.getInfo(outputPath)
                                .then((data) => {
                                    resolve({
                                        time: FFMPEG.timeSig(data),
                                        resolution: FFMPEG.resolutionSig(data),
                                    });
                                })
                                .catch((error) => {
                                    console.log("=========");
                                    console.log(error);
                                    console.log("=========");
                                    reject();
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
                    });

                FFMPEG.getResolution((res) => {
                    if (res.width > 1080) {
                        __CONVERTER__.addOption(
                            "-vf",
                            "scale=1920x1080:flags=lanczos",
                        );

                        __CONVERTER__.run();
                    }
                });
            } catch (error) {
                console.log("=========");
                console.log(error);
                console.log("=========");
                reject();
            }
        });
    }
}

export default FFMPEG;
