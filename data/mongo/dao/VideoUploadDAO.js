import dotenv from "dotenv"
dotenv.config()

import __BaseDAO__ from "./__BaseDAO__.js";
import VideoUpload from "../models/VideoUpload.js";
import VideoUploadSchema from "../schemas/VideoUploadSchema.js";
import FFMPEG from "../../../video/FFMPEG.js";

const UPLOAD_AUTHORIZED = process.env.UPLOAD_AUTHORIZED;

class VideoUploadDAO {
    static listAll(query = {}) {
        return __BaseDAO__.__search__(VideoUpload, query, {}, { createdAt: 1 });
    }

    static getProcessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, {
                    isUploaded: true,
                    isProcessed: true,
                })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static getUnprocessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, {
                    isUploaded: true,
                    isProcessed: false,
                    hasError: false,
                })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static search(sourceFile) {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, { sourceFile })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static create(upload) {
        return new Promise((resolve, reject) => {
            const video = new VideoUpload({
                ...upload,
                createdAt: Date.now(),
            });
            __BaseDAO__.__save__(video).then(() => {
                resolve();
            });
        });
    }

    static save(document) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__save__(document).then(() => {
                resolve();
            });
        });
    }

    static uploadComplete(details) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(VideoUpload, { ...details }).then((doc) => {
                FFMPEG.getDuration(
                    `${UPLOAD_AUTHORIZED}/${details.uuid}.${doc.extension}`,
                ).then((duration) => {
                    doc.duration = duration;
                    doc.isUploaded = true;
                    __BaseDAO__.__save__(doc);
                    resolve();
                });
            });
        });
    }

    static get(uuid) {
        return __BaseDAO__.__get__(VideoUpload, { uuid });
    }

    static account(address) {
        return new Promise((resolve, reject) => {
            const query = {
                address,
            };
            __BaseDAO__.__search__(VideoUpload, query).then((results) => {
                const videos = [];
                for (const row of results) {
                    const r = {};
                    for (const key of Object.keys(VideoUploadSchema)) {
                        r[key] = row[key];
                    }
                    videos.push(r);
                }

                resolve(videos);
            });
        });
    }
}

export default VideoUploadDAO;
