import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Authentication from "../../util/Authentication.js";

const STORAGE = new GridFsStorage({
    url: process.env.OMAKASEA_URL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const auth = Authentication.parse(req);
            if (Authentication.isAuthorized(auth)) {
                const classID = req.headers.classid;
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: process.env.BUCKET_NAME,
                    metadata: {
                        classID,
                    },
                };
                resolve(fileInfo);
            } else {
                reject({ error: "unauthorized file upload" });
            }
        });
    },
});
const UploadImageDB = multer({ storage: STORAGE, preservePath: true });
Object.freeze(UploadImageDB);

export default UploadImageDB;
