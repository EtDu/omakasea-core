import dotenv from "dotenv";
dotenv.config();

const IPFS_HOST = process.env.IPFS_HOST;
const IPFS_PORT = process.env.IPFS_PORT;
const IPFS_URL = `http://${IPFS_HOST}:${IPFS_PORT}/ipfs`;

const VALIDATOR_HOST = process.env.VALIDATOR_HOST;
const VALIDATOR_PORT = process.env.VALIDATOR_PORT;
const VALIDATOR_URL = `http://${VALIDATOR_HOST}:${VALIDATOR_PORT}`;

import fs from "fs";
import axios from "axios";
import { create } from "ipfs-http-client";

import UploadDAO from "../mongo/dao/UploadDAO.js";
import VideoDAO from "../mongo/dao/VideoDAO.js";
import FFMPEG from "../../video/FFMPEG.js";
import FileSystem from "../../util/FileSystem.js";
import Client from "../../http/Client.js";

async function ipfsClient() {
    const config = {
        host: IPFS_HOST,
        port: 5001,
    };

    return await create(config);
}

class IPFS {
    static async savePlaylist(files) {
        try {
            const ipfs = await ipfsClient();
            const cid = await ipfs.add(JSON.stringify(files), {
                pin: true,
            });

            return cid.path;
        } catch (error) {
            console.log(`IPFS.saveplaylist -- ${error}`);
        }
        return null;
    }

    static download(video) {
        const { cid } = video;
        const downloadPath = FileSystem.getDownloadPath(video);

        return new Promise((resolve, reject) => {
            FileSystem.delete(downloadPath);
            const writer = fs.createWriteStream(downloadPath);
            const url = `${IPFS_URL}/${cid}`;

            axios({
                url,
                method: "GET",
                responseType: "stream",
            }).then((response) => {
                response.data.pipe(writer);

                writer.on("finish", resolve);
                writer.on("error", reject);
            });
        });
    }

    static async upload(data, callback) {
        const ipfs = await ipfsClient();
        const query = { address: data.address };

        this.__upload__(ipfs, data, () => {
            VideoDAO.search({
                folderUUID: data.folderUUID,
                isActive: true,
            }).then(async (videos) => {
                const files = [];
                const SORT_BY = (a, b) => {
                    return b.createdAt - a.createdAt;
                };

                for (const video of videos.sort(SORT_BY)) {
                    if (video.cid && video.isActive) {
                        files.push({
                            name: video.filename,
                            cid: video.cid,
                            uploadedAt: video.createdAt,
                        });
                    }
                }
                const cid = await ipfs.add(JSON.stringify(files), {
                    pin: true,
                });

                data.cid = cid.path;
                UploadDAO.save(data).then(() => {
                    callback(data);
                });
            });
        });
    }

    static async __upload__(ipfs, data, callback = null) {
        const query = {
            folderUUID: data.folderUUID,
        };

        VideoDAO.search(query).then(async (videos) => {
            const files = [];
            const index = {};
            const payload = [];

            for (const video of videos) {
                const fPath = FileSystem.getUploadPath(video);
                const content = fs.readFileSync(fPath);

                files.push({
                    path: video.filename,
                    content,
                });

                index[video.filename] = {
                    fPath,
                    uuid: video.uuid,
                };
            }

            const uploaded = await ipfs.addAll(files, {
                wrapWithDirectory: true,
                pin: true,
            });

            for await (const upload of uploaded) {
                if (upload.path.length > 0) {
                    const cid = upload.cid.toString();
                    const file = { cid, ...index[upload.path] };
                    payload.push(file);
                }
            }

            Client.post(VALIDATOR_URL, { data: payload }).then(() => {
                if (callback !== null) {
                    callback();
                }
            });
        });
    }
}

export default IPFS;
