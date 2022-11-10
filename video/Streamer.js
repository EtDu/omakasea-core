import dotenv from "dotenv";
dotenv.config();

const RTMP_URL = `${process.env.RELAY_RTMP_URL}=${process.env.STREAM_KEY}`;

import Client from "../http/Client.js";
import FFMPEG from "../video/FFMPEG.js";
import FileSystem from "../util/FileSystem.js";

const BROADCASTER_HOST = process.env.BROADCASTER_HOST;
const BROADCASTER_PORT = process.env.BROADCASTER_PORT;
const BROADCASTER_URL = `http://${BROADCASTER_HOST}:${BROADCASTER_PORT}`;

const ERROR_DELAY = 60 * 1000;

class Streamer {
    static next(data) {
        return new Promise((resolve, reject) => {
            if (FileSystem.exists(data.playing)) {
                FileSystem.delete(data.playing);
            }
            Client.post(`${BROADCASTER_URL}/next`, { data: data })
                .then(resolve)
                .catch(() => {
                    console.log("\nPLAYER IS DOWN");
                    resolve();
                });
        });
    }

    static start(video) {
        return new Promise((resolve, reject) => {
            console.log(`P > ${video.uuid}`);
            FFMPEG.stream(video.playing, RTMP_URL)
                .then(() => {
                    Streamer.next(video).then(resolve);
                })
                .catch(() => {
                    console.log(`S * ${video.uuid}`);
                    setTimeout(() => {
                        Streamer.next(video).then(resolve);
                    }, ERROR_DELAY);
                });
        });
    }
}

export default Streamer;
