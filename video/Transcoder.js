import FileSystem from "../util/FileSystem.js";
import FFMPEG from "../video/FFMPEG.js";
import IPFS from "../data/net/IPFS.js";

const HOURS = 3;
const TIME_BUFFER = HOURS * 3600;
const ERROR_BUFFER_MAX = 3;

class Transcoder {
    static download(data) {
        return new Promise((resolve, reject) => {
            const FILES = {
                downloads: [],
                transcoded: [],
            };

            this.__download__(resolve, data, FILES);
        });
    }

    static __download__(resolve, data, files) {
        if (data.listing.length > 0) {
            const video = data.listing.shift();

            const dPath = FileSystem.getDownloadPath(video);
            const tPath = FileSystem.getTranscodePath(video);

            let op = "C";

            if (!data.isLoaded && data.listing.length < ERROR_BUFFER_MAX) {
                FileSystem.delete(dPath);
                FileSystem.delete(tPath);
                op = "R";
            }

            const isDownloaded = FileSystem.exists(dPath);
            const isTranscoded = FileSystem.exists(tPath);

            const options = {};

            if (!isDownloaded && !isTranscoded) {
                IPFS.download(video).then(() => {
                    if (FileSystem.exists(dPath)) {
                        files.downloads.push(dPath);
                        console.log(`${op} | ${video.uuid}`);
                        FFMPEG.convert(video, options)
                            .then(() => {
                                files.transcoded.push(tPath);
                                FileSystem.delete(dPath);
                                this.__download__(resolve, data, files);
                            })
                            .catch(() => {
                                console.log(
                                    `Transcoder.__download__ : !isDownloaded && !isTranscoded`,
                                );
                            });
                    } else {
                        console.log(
                            `T * ${video.uuid} | ${FileSystem.exists(tPath)}`,
                        );
                        this.__download__(resolve, data, files);
                    }
                });
            } else if (!isTranscoded) {
                FFMPEG.convert(video, options)
                    .then(() => {
                        if (isDownloaded) {
                            FileSystem.delete(dPath);
                        }

                        files.transcoded.push(tPath);
                        this.__download__(resolve, data, files);
                    })
                    .catch(() => {
                        console.log(`Transcoder.__download__ : !isTranscoded`);
                    });
            } else {
                if (isDownloaded) {
                    FileSystem.delete(dPath);
                }

                files.transcoded.push(tPath);
                FileSystem.delete(dPath);
                this.__download__(resolve, data, files);
            }
        } else {
            resolve(files);
        }
    }
}

export default Transcoder;
