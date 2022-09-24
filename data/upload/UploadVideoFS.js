const multer = require("multer");

const Authentication = require("../../util/Authentication");
const VideoUploadDAO = require("../mongo/dao/VideoUploadDAO");

const UPLOAD_AUTHORIZED = process.env.UPLOAD_AUTHORIZED;
const UPLOAD_UNAUTHORIZED = process.env.UPLOAD_UNAUTHORIZED;

const ALLOWED = [
    "0x49706203f6daA5979C9F09d7ee12B0a98F549ac9",
    "0x4ed4496Feaadac920Fd76f7EdEef2900C292EcFD",
    "0xA5e541194aD9DE1D54cCccc6E3dB6a8158e68A04",
];

function isWhiteListed(auth) {
    return ALLOWED.includes(auth.addr);
}

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        const auth = Authentication.parse(req);
        if (Authentication.isAuthorized(auth) && isWhiteListed(auth)) {
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
