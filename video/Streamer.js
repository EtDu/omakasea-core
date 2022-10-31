import dotenv from "dotenv";
dotenv.config();

const RTMP_URL = `${process.env.RELAY_RTMP_URL}=${process.env.STREAM_KEY}`;

import Client from "../http/Client.js";
import FFMPEG from "../video/FFMPEG.js";
import FileSystem from "../util/FileSystem.js";

const PLAYER_HOST = process.env.PLAYER_HOST;
const PLAYER_PORT = process.env.PLAYER_PORT;
const PLAYER_URL = `http://${PLAYER_HOST}:${PLAYER_PORT}`;

class Streamer {
    static next(data) {
        return new Promise((resolve, reject) => {
            Client.post(PLAYER_URL, {
                data: {
                    ...data,
                },
            })
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
            FFMPEG.stream(video.path, RTMP_URL)
                .then(() => {
                    Streamer.next(video).then(resolve);
                })
                .catch(() => {
                    console.log(`S * ${video.uuid}`);
                    Streamer.next(video).then(resolve);
                });
        });
    }
}

export default Streamer;
