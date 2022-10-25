import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import Upload from "../models/Upload.js";

class UploadDAO {
    static getReady() {
        return __BaseDAO__.__search__(Upload, {
            cid: null,
            isReady: true,
        });
    }

    static save(upload) {
        return __BaseDAO__.__save__(upload);
    }

    static get(query) {
        return __BaseDAO__.__get__(Upload, query);
    }

    static search(query) {
        return __BaseDAO__.__search__(Upload, query, {}, { createdAt: 1 });
    }

    static init(request) {
        return new Promise((resolve, reject) => {
            const address = request.address;
            const folderUUID = crypto.randomUUID();
            const files = request.files;
            const createdAt = Date.now();
            const upload = new Upload({
                address,
                folderUUID,
                files,
                createdAt,
            });

            __BaseDAO__.__save__(upload).then((doc) => {
                resolve(upload.folderUUID);
            });
        });
    }

    static increment(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(Upload, query).then((upload) => {
                upload.count += 1;
                console.log(`${upload.files.length} === ${upload.count}`);
                upload.isReady = upload.files.length === upload.count;
                __BaseDAO__.__save__(upload).then(() => {
                    resolve(upload.isReady);
                });
            });
        });
    }
}

export default UploadDAO;
