import __BaseDAO__ from "./__BaseDAO__.js";
import Video from "../models/Video.js";
import VideoSchema from "../schemas/VideoSchema.js";

class VideoDAO {
    static updateIPFS(data) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(Video, { uuid: data.uuid }).then((video) => {
                video.cid = data.cid;
                video.metadata = data.metadata;
                __BaseDAO__.__save__(video).then(resolve);
            });
        });
    }

    static get(query) {
        return __BaseDAO__.__get__(Video, query);
    }

    static search(query = {}) {
        return __BaseDAO__.__search__(Video, query, {}, { createdAt: 1 });
    }

    static getProcessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(Video, {
                    isUploaded: true,
                    isMerged: true,
                })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static getUnprocessed() {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__search__(Video, {
                    isUploaded: true,
                    isMerged: false,
                    hasError: false,
                })
                .then((documents) => {
                    resolve(documents);
                });
        });
    }

    static create(upload) {
        return new Promise((resolve, reject) => {
            const video = new Video({
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
            __BaseDAO__.__get__(Video, { ...details }).then((doc) => {
                doc.isUploaded = true;
                __BaseDAO__.__save__(doc);
                resolve(doc);
            });
        });
    }

    static get(uuid) {
        return __BaseDAO__.__get__(Video, { uuid });
    }

    static account(address) {
        return new Promise((resolve, reject) => {
            const query = {
                address,
            };
            __BaseDAO__.__search__(Video, query).then((results) => {
                const videos = [];
                for (const row of results) {
                    const r = {};
                    for (const key of Object.keys(VideoSchema)) {
                        r[key] = row[key];
                    }
                    videos.push(r);
                }

                resolve(videos);
            });
        });
    }
}

export default VideoDAO;
