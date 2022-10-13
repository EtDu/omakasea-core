import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import FolderUpload from "../models/FolderUpload.js";

const UPLOAD_AUTHORIZED = process.env.UPLOAD_AUTHORIZED;

class FolderUploadDAO {
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
}

export default FolderUploadDAO;
