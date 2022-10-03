const __BaseDAO__ = require("./__BaseDAO__");

const VideoUpload = require("../models/VideoUpload");
const VideoUploadSchema = require("../schemas/VideoUploadSchema");

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

    static uploadComplete(uuid) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(VideoUpload, { uuid }).then((doc) => {
                doc.isUploaded = true;
                __BaseDAO__.__save__(doc);
                resolve();
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

module.exports = VideoUploadDAO;
