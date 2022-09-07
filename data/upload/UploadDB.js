const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Authentication = require("../../util/Authentication");

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
const UploadDB = multer({ storage: STORAGE, preservePath: true });
Object.freeze(UploadDB);

module.exports = UploadDB;
