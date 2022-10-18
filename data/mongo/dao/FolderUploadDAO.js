import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import FolderUpload from "../models/FolderUpload.js";

class FolderUploadDAO {
    static getReady() {
        return __BaseDAO__.__search__(FolderUpload, {
            cid: null,
            isReady: true,
        });
    }

    static updateIPFS(data) {
        __BaseDAO__
            .__get__(FolderUpload, { uuid: data.uuid })
            .then((folder) => {
                folder.cid = data.cid;
                __BaseDAO__.__save__(folder);
            });
    }

    static get(uuid) {
        return __BaseDAO__.__get__(FolderUpload, { uuid });
    }

    static init(upload) {
        return new Promise((resolve, reject) => {
            const uuid = crypto.randomUUID();
            const folder = new FolderUpload({
                ...upload,
                uuid,
                createdAt: Date.now(),
            });
            __BaseDAO__.__save__(folder).then(() => {
                resolve(folder);
            });
        });
    }

    static increment(uuid) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(FolderUpload, { uuid }).then((folder) => {
                folder.count += 1;
                folder.isReady = folder.count === folder.files.length;
                __BaseDAO__.__save__(folder).then((doc) => {
                    resolve(doc.isReady);
                });
            });
        });
    }
}

export default FolderUploadDAO;
