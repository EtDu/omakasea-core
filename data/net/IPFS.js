import dotenv from "dotenv";
dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR;
const IPFS_URL = process.env.IPFS_URL;
const IPFS_PORT = process.env.IPFS_PORT;

import fs from "fs";
import axios from "axios";
import { create } from "ipfs-http-client";

import UploadDAO from "../mongo/dao/UploadDAO.js";
import VideoDAO from "../mongo/dao/VideoDAO.js";
import FFMPEG from "../../video/FFMPEG.js";
import FileSystem from "../../util/FileSystem.js";

async function ipfsClient() {
    const config = {
        host: "192.168.86.102",
        port: 5001,
    };

    return await create(config);
}

class IPFS {
    static download(video) {
        const { cid } = video;
        const downloadPath = FileSystem.getDownloadPath(video);

        return new Promise((resolve, reject) => {
            FileSystem.delete(downloadPath);
            const writer = fs.createWriteStream(downloadPath);
            const url = `http://${IPFS_URL}:${IPFS_PORT}/ipfs/${cid}`;

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
        UploadDAO.get(query).then(async (upload) => {
            this.__upload__(ipfs, upload, () => {
                console.log("callback");
                VideoDAO.search({ address: data.address, isActive: true }).then(
                    async (videos) => {
                        const files = [];
                        for (const video of videos) {
                            files.push({
                                name: video.filename,
                                cid: video.cid,
                            });
                        }

                        UploadDAO.get(query).then(async (upload) => {
                            const cid = await ipfs.add(JSON.stringify(files), {
                                pin: true,
                            });

                            upload.history.push(cid.path);
                            UploadDAO.updateIPFS(upload).then(() => {
                                callback();
                            });
                        });
                    },
                );
            });
        });
    }

    static async __upload__(ipfs, upload, callback = null) {
        const pending = [...upload.pending];

        if (pending.length > 0) {
            const folderUUID = pending[0];
            const query = {
                address: upload.address,
                folderUUID,
            };

            VideoDAO.search(query).then(async (videos) => {
                let folderCID;

                const files = [];
                const index = {};

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

                    const ipfs = await ipfsClient();
                    const uploaded = await ipfs.addAll(files, {
                        wrapWithDirectory: true,
                        pin: true,
                    });

                    for await (const upload of uploaded) {
                        if (upload.path.length > 0) {
                            index[upload.path].cid = upload.cid.toString();
                        } else {
                            folderCID = upload.cid.toString();
                        }
                    }
                }

                let ipfsFiles = [];
                for (const key of Object.keys(index)) {
                    const file = index[key];
                    ipfsFiles.push({
                        name: key,
                        cid: file.cid,
                    });
                }

                ipfsFiles = ipfsFiles.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                });

                pending.shift();
                upload.pending = pending;

                UploadDAO.updateIPFS(upload).then(() => {
                    const keys = Object.keys(index);
                    let count = keys.length;
                    for (const key of keys) {
                        try {
                            FFMPEG.getMetadata(index[key].fPath)
                                .then((metadata) => {
                                    index[key].metadata = metadata;
                                    VideoDAO.updateIPFS(index[key]).then(() => {
                                        count--;
                                        FileSystem.delete(index[key].fPath);

                                        if (count === 0) {
                                            this.__upload__(
                                                ipfs,
                                                upload,
                                                callback,
                                            );
                                        }
                                    });
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        } catch (error) {
                            console.log("==============");
                            console.log(error);
                            console.log("==============");
                        }
                    }
                });
            });
        } else if (callback !== null) {
            callback();
        }
    }
}

export default IPFS;
