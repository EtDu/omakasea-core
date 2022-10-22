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

    static updateIPFS(upload) {
        upload.markModified("history");
        upload.markModified("pending");
        upload.markModified("folders");
        return __BaseDAO__.__save__(upload);
    }

    static get(query) {
        return __BaseDAO__.__get__(Upload, query);
    }

    static init(request) {
        return new Promise((resolve, reject) => {
            const query = { address: request.address };
            __BaseDAO__.__get__(Upload, query).then((result) => {
                let upload = result;
                if (upload === null) {
                    upload = new Upload({
                        address: request.address,
                        createdAt: Date.now(),
                    });
                }

                const uuid = crypto.randomUUID();

                upload.folders[uuid] = {
                    size: request.folder.length,
                    count: 0,
                };

                upload.markModified("folders");
                __BaseDAO__.__save__(upload).then((doc) => {
                    resolve(uuid);
                });
            });
        });
    }

    static increment(target) {
        return new Promise((resolve, reject) => {
            __BaseDAO__
                .__get__(Upload, { address: target.address })
                .then((upload) => {
                    upload.folders[target.uuid].count += 1;
                    const isReady =
                        upload.folders[target.uuid].size ===
                        upload.folders[target.uuid].count;

                    if (isReady) {
                        upload.pending.push(target.uuid);
                        upload.markModified("pending");
                    }

                    upload.markModified("folders");
                    __BaseDAO__.__save__(upload).then(() => {
                        resolve(isReady);
                    });
                });
        });
    }
}

export default UploadDAO;
