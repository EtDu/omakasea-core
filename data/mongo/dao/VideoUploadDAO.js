const __BaseDAO__ = require("./__BaseDAO__");

const VideoUpload = require("../models/VideoUpload");

class VideoUploadDAO {
    static getProcessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, { isProcessed: true })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static getUnprocessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, { isProcessed: false })
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
}

module.exports = VideoUploadDAO;
