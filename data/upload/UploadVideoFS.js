const multer = require("multer");

const Authentication = require("../../util/Authentication");
const VideoUploadDAO = require("../mongo/dao/VideoUploadDAO");

const UPLOAD_AUTHORIZED = "../_uploads/authorized";
const UPLOAD_PLAYBACK = "../_uploads/playback";
const UPLOAD_STREAM = "../_uploads/stream";
const UPLOAD_UNAUTHORIZED = "../_uploads/unauthorized";

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        const auth = Authentication.parse(req);
        if (Authentication.isAuthorized(auth)) {
            const filename = file.originalname.replaceAll(" ", "_");

            const rootName = filename.split(".")[0];
            const sourceFile = `${UPLOAD_AUTHORIZED}/${filename}`;
            const mp4File = `${UPLOAD_PLAYBACK}/${rootName}.mp4`;
            const hlsFile = `${UPLOAD_STREAM}/${rootName}.ts`;

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
