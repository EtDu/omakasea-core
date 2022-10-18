import dotenv from "dotenv";
dotenv.config();

import Queue from "mnemonist/queue.js";

import Broadcaster from "../net/Broadcaster.js";
import Listener from "../redis/Listener.js";

import VideoUploadDAO from "../data/mongo/dao/VideoUploadDAO.js";
import FileSystem from "../util/FileSystem.js";

import IPFS from "../data/net/IPFS.js";
import FFMPEG from "./FFMPEG.js";

const HOURS = 3;
const TIME_BUFFER = HOURS * 3600;

class Playlist {
    constructor(folderUUID) {
        this.folderUUID = folderUUID;

        this.seconds = 0;
        this.index = 0;

        this.videos;
        this.downloads = new Queue();
        this.pending = new Queue();

        this.broadcaster = Broadcaster.create("PLAYLIST");

        this.current = {};

        this.listener = new Listener();
        this.listener.listen(`PLAYLIST/${this.folderUUID}`, (data) => {
            if (data.opcode === "complete") {
                this.seconds -= this.toSeconds(this.current.metadata);

                FileSystem.delete(data.current);
                FileSystem.delete(FileSystem.getDownloadPath(this.current));

                this.download();
                this.playCurrent();
            }
        });
    }

    toSeconds(metadata) {
        return (
            metadata.duration.hours * 3600 +
            metadata.duration.minutes * 60 +
            metadata.duration.seconds
        );
    }

    run() {
        VideoUploadDAO.search({ folderUUID: this.folderUUID }).then(
            (videos) => {
                this.videos = videos;

                this.download().then(() => {
                    this.playCurrent();
                });
            },
        );
    }

    queueDownloads() {
        while (this.seconds < TIME_BUFFER) {
            const video = this.videos[this.index];

            this.downloads.enqueue(video);
            this.seconds += this.toSeconds(video.metadata);

            if (this.index < this.videos.length - 1) {
                this.index++;
            } else {
                this.index = 0;
            }
        }
    }

    download() {
        this.queueDownloads();
        return new Promise((resolve, reject) => {
            let count = this.downloads.size;
            while (this.downloads.size > 0) {
                const next = this.downloads.dequeue();
                this.pending.enqueue(next);

                IPFS.download(next).then(() => {
                    FFMPEG.convert(next).then(() => {
                        count--;
                        if (count === 0) {
                            resolve();
                        }
                    });
                });
            }
        });
    }

    playCurrent() {
        this.current = this.pending.dequeue();
        this.broadcaster.send({
            opcode: "stream",
            folderUUID: this.folderUUID,
            current: FileSystem.getTranscodePath(this.current),
        });
    }
}

export default Playlist;
