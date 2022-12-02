import FileSystem from "../util/FileSystem.js";
import FFMPEG from "../video/FFMPEG.js";
import IPFS from "../data/net/IPFS.js";
import Playlist from "./Playlist.js";

const ERROR_BUFFER_MAX = 1;

class Transcoder {
    static download(channel) {
        return new Promise((resolve, reject) => {
            const FILES = {
                downloads: [],
                transcoded: [],
            };

            this.__download__(resolve, channel, FILES);
        });
    }

    static __download__(resolve, channel, files) {
        if (channel.list.length > 0) {
            const video = channel.list.shift();
            const { cid } = video;

            const dPath = FileSystem.getDownloadPath(video);
            const tPath = FileSystem.getTranscodePath(video);

            let op = "T";

            if (
                !channel.status.isLoaded &&
                channel.list.length < ERROR_BUFFER_MAX
            ) {
                FileSystem.delete(dPath);
                FileSystem.delete(tPath);
                op = "R";
            }

            const isDownloaded = FileSystem.exists(dPath);
            const isTranscoded = FileSystem.exists(tPath);

            const options = {};

            const errMsg = `${video.uuid} | ${FileSystem.exists(
                dPath,
            )} | ${FileSystem.exists(tPath)}`;

            if (!isDownloaded && !isTranscoded) {
                IPFS.download(video).then(() => {
                    if (FileSystem.exists(dPath)) {
                        files.downloads.push(dPath);
                        console.log(`${op} | ${video.uuid} | ${cid}`);
                        if (video.boundary) {
                            options.endsAt = Playlist.toTimeKey(
                                Playlist.toSeconds(video.boundary),
                            );
                        }

                        FFMPEG.convert(video, options)
                            .then(() => {
                                files.transcoded.push(tPath);
                                FileSystem.delete(dPath);
                                this.__download__(resolve, channel, files);
                            })
                            .catch(() => {
                                console.log(`T * ${errMsg}`);

                                FileSystem.delete(dPath);
                                this.__download__(resolve, channel, files);
                            });
                    } else {
                        console.log(`T * ${errMsg}`);
                        FileSystem.delete(dPath);
                        this.__download__(resolve, channel, files);
                    }
                });
            } else if (!isTranscoded) {
                FFMPEG.convert(video, options)
                    .then(() => {
                        if (isDownloaded) {
                            FileSystem.delete(dPath);
                        }

                        files.transcoded.push(tPath);
                        this.__download__(resolve, channel, files);
                    })
                    .catch(() => {
                        console.log(`T ^ ${errMsg}`);
                        this.__download__(resolve, channel, files);
                    });
            } else {
                if (isDownloaded) {
                    FileSystem.delete(dPath);
                }

                files.transcoded.push(tPath);
                FileSystem.delete(dPath);
                this.__download__(resolve, channel, files);
            }
        } else {
            resolve(files);
        }
    }
}

export default Transcoder;
