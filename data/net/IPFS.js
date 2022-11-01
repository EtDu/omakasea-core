import dotenv from "dotenv";
dotenv.config();

const IPFS_HOST = process.env.IPFS_HOST;
const IPFS_PORT = process.env.IPFS_PORT;
const IPFS_URL = `http://${IPFS_HOST}:${IPFS_PORT}/ipfs`;

import fs from "fs";
import axios from "axios";
import { create } from "ipfs-http-client";

import VideoDAO from "../mongo/dao/VideoDAO.js";
import FileSystem from "../../util/FileSystem.js";

const SORT_BY = (a, b) => {
    return b.createdAt - a.createdAt;
};

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
        const folderUUID = data.folderUUID;

        this.__upload__(ipfs, data, (mapping) => {
            VideoDAO.search({ folderUUID }).then(async (videos) => {
                const files = [];
                const listing = [];
                for (const video of videos.sort(SORT_BY)) {
                    video.cid = mapping[video.uuid];
                    VideoDAO.save(video);
                    FileSystem.delete(FileSystem.getUploadPath(video));

                    files.push({
                        name: video.filename,
                        cid: video.cid,
                        uploadedAt: video.createdAt,
                    });
                    listing.push({
                        name: video.filename,
                        uuid: video.uuid,
                        cid: video.cid,
                        createdAt: video.createdAt,
                        metadata: video.metadata,
                    });
                }

                const cid = await ipfs.add(JSON.stringify(files), {
                    pin: true,
                });

                if (callback !== null) {
                    callback({ cid: cid.path, listing });
                }
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
            const mapping = {};

            for (const video of data.files) {
                const uPath = FileSystem.getUploadPath(video);
                const content = fs.readFileSync(uPath);

                files.push({
                    path: video.filename,
                    content,
                });

                index[video.filename] = {
                    uuid: video.uuid,
                };
            }

            const uploaded = await ipfs.addAll(files, {
                wrapWithDirectory: true,
                pin: true,
            });

            for await (const upload of uploaded) {
                if (upload.path.length > 0) {
                    mapping[index[upload.path].uuid] = upload.cid.toString();
                }
            }

            if (callback !== null) {
                callback(mapping);
            }
        });
    }
}

export default IPFS;
