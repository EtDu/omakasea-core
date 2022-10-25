import dotenv from "dotenv";
dotenv.config();

const RTMP_URL = `${process.env.RELAY_RTMP_URL}=${process.env.STREAM_KEY}`;

import Client from "../http/Client.js";
import VideoDAO from "../data/mongo/dao/VideoDAO.js";
import FFMPEG from "../video/FFMPEG.js";
import FileSystem from "../util/FileSystem.js";

const PLAYER_HOST = process.env.PLAYER_HOST;
const PLAYER_PORT = process.env.PLAYER_PORT;
const PLAYER_URL = `http://${PLAYER_HOST}:${PLAYER_PORT}`;

class Streamer {
    static next(req) {
        Client.post(PLAYER_URL, {
            data: {
                ...req.body,
            },
        }).catch(() => {
            console.log("\nPLAYER IS DOWN");
        });
    }

    static start(req) {
        return new Promise((resolve, reject) => {
            const query = {
                cid: req.body.cid,
                createdAt: req.body.uploadedAt,
            };

            VideoDAO.get(query).then((video) => {
                console.log(`P > ${video.uuid}`);
                const path = FileSystem.getTranscodePath(video);
                FFMPEG.stream(path, RTMP_URL).then(() => {
                    Streamer.next(req);
                });
            });
        });
    }
}

export default Streamer;
