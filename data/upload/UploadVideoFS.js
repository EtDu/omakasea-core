const crypto = require("crypto");
const multer = require("multer");

const Authentication = require("../../util/Authentication");
const VideoUploadDAO = require("../mongo/dao/VideoUploadDAO");
const ContributorDAO = require("../mongo/dao/ContributorDAO");

const UPLOAD_AUTHORIZED = process.env.UPLOAD_AUTHORIZED;

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_AUTHORIZED);
    },
    filename: (req, file, cb) => {
        const auth = Authentication.parse(req);

        const filename = file.originalname;
        const toks = filename.split(".");
        const extension = toks[toks.length - 1];

        req.uuid = crypto.randomUUID();
        const sourceFile = `${req.uuid}.${extension}`;

        const upload = {
            uuid: req.uuid,
            address: auth.addr,
            filename,
        };

        VideoUploadDAO.create(upload).then(() => {
            cb(null, sourceFile);
        });
    },
});

const UploadFS = multer({
    storage: fileStorageEngine,
    fileFilter: (req, file, cb) => {
        const auth = Authentication.parse(req);
        if (Authentication.isAuthorized(auth)) {
            ContributorDAO.isContributor(auth.addr).then((isActive) => {
                if (isActive) {
                    req.authorized = true;
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            });
        }
    },
});
Object.freeze(UploadFS);

module.exports = UploadFS;
