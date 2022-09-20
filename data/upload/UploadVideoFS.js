const multer = require("multer");

const Authentication = require("../../util/Authentication");
const VideoUploadDAO = require("../mongo/dao/VideoUploadDAO");

const UPLOAD_AUTHORIZED = process.env.UPLOAD_AUTHORIZED;
const UPLOAD_UNAUTHORIZED = process.env.UPLOAD_UNAUTHORIZED;

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        const auth = Authentication.parse(req);
        if (Authentication.isAuthorized(auth)) {
            const filename = file.originalname.replaceAll(" ", "_");

            const rootName = filename.split(".")[0];
            const sourceFile = filename;
            const mp4File = `${rootName}.mp4`;
            const hlsFile = `${rootName}.ts`;

            const upload = {
                sourceFile,
                mp4File,
                hlsFile,
                address: auth.addr,
            };

            VideoUploadDAO.create(upload).then(() => {
                callback(null, UPLOAD_AUTHORIZED);
            });
        } else {
            callback(null, UPLOAD_UNAUTHORIZED);
        }
    },

    filename: (req, file, callback) => {
        callback(null, file.originalname.replaceAll(" ", "_"));
    },
});

const UploadFS = multer({ storage: fileStorageEngine });
Object.freeze(UploadFS);

module.exports = UploadFS;
