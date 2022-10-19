import dotenv from "dotenv";
dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR;
const IPFS_URL = process.env.IPFS_URL;
const IPFS_PORT = process.env.IPFS_PORT;

import fs from "fs";
import axios from "axios";
import { create } from "ipfs-http-client";

import FolderUploadDAO from "../mongo/dao/FolderUploadDAO.js";
import VideoUploadDAO from "../mongo/dao/VideoUploadDAO.js";
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
    static async uploadReady() {
        return new Promise((resolve, reject) => {
            FolderUploadDAO.getReady().then(async (folders) => {
                for (const folder of folders) {
                    await IPFS.uploadDir(folder.uuid);
                }
                resolve();
            });
        });
    }

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

    static async uploadDir(folderUUID) {
        VideoUploadDAO.search({ folderUUID }).then(async (videos) => {
            const files = [];
            const index = {
                FOLDER: { uuid: folderUUID },
            };
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
            const ipfs = await ipfsClient();
            const uploaded = await ipfs.addAll(files, {
                wrapWithDirectory: true,
                pin: true,
            });
            for await (const upload of uploaded) {
                if (upload.path.length > 0) {
                    index[upload.path].cid = upload.cid.toString();
                } else {
                    index["FOLDER"].cid = upload.cid.toString();
                }
            }

            for (const key of Object.keys(index)) {
                if (key === "FOLDER") {
                    FolderUploadDAO.updateIPFS(index[key]);
                } else {
                    try {
                        FFMPEG.getMetadata(index[key].fPath)
                            .then((metadata) => {
                                index[key].metadata = metadata;
                                VideoUploadDAO.updateIPFS(index[key]);
                                FileSystem.delete(index[key].fPath);
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
            }
        });
    }
}

export default IPFS;
