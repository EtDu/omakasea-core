const __BaseDAO__ = require("./__BaseDAO__");

const VideoUpload = require("../models/VideoUpload");

class VideoUploadDAO {
    static getUnprocessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(VideoUpload, {
                    isUploaded: true,
                    isProcessed: false,
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
}

module.exports = VideoUploadDAO;
