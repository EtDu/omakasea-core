import __BaseDAO__ from "./__BaseDAO__.js";
import VideoUpload from "../models/VideoUpload.js";
import VideoUploadSchema from "../schemas/VideoUploadSchema.js";

class VideoUploadDAO {
    static updateIPFS(data) {
        __BaseDAO__
            .__get__(VideoUpload, { uuid: data.uuid, isUploaded: true })
            .then((video) => {
                video.cid = data.cid;
                video.metadata = data.metadata;
                __BaseDAO__.__save__(video);
            });
    }

    static search(query = {}) {
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
                doc.isUploaded = true;
                __BaseDAO__.__save__(doc);
                resolve(doc);
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
