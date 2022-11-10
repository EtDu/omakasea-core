import dotenv from "dotenv";
dotenv.config();

const RTMP_URL = `${process.env.RELAY_RTMP_URL}=${process.env.STREAM_KEY}`;

import Client from "../http/Client.js";
import FFMPEG from "../video/FFMPEG.js";

const BROADCASTER_HOST = process.env.BROADCASTER_HOST;
const BROADCASTER_PORT = process.env.BROADCASTER_PORT;
const BROADCASTER_URL = `http://${BROADCASTER_HOST}:${BROADCASTER_PORT}`;

const ERROR_DELAY = 5000;
const STREAM_DELAY = 5000;

class Streamer {
    static cleanup(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Client.post(`${BROADCASTER_URL}/next`, { data: data })
                    .then(resolve)
                    .catch(() => {
                        console.log(
                            `\nPLAYER IS DOWN WAITING ${ERROR_DELAY / 1000}s`,
                        );
                        remove(data);
                        resolve();
                    });
            }, STREAM_DELAY);
        });
    }

    static start(video) {
        return new Promise((resolve, reject) => {
            console.log(`S > ${video.uuid}`);
            FFMPEG.stream(video.playing, RTMP_URL)
                .then(() => {
                    Streamer.cleanup(video).then(resolve);
                })
                .catch(() => {
                    console.log(`S * ${video.uuid}`);
                    setTimeout(() => {
                        Streamer.cleanup(video).then(resolve);
                    }, ERROR_DELAY);
                });
        });
    }
}

export default Streamer;
