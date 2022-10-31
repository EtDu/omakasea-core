import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import multer from "multer";

import Authentication from "../../util/Authentication.js";
import VideoDAO from "../mongo/dao/VideoDAO.js";
import ContributorDAO from "../mongo/dao/ContributorDAO.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR;

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const message = input.message;
        const data = JSON.parse(message);
        const address = req.session.address;

        const filename = file.originalname;
        const toks = filename.split(".");
        const extension = toks[toks.length - 1];

        req.uuid = crypto.randomUUID();
        req.folderUUID = req.headers.folderuuid;
        const sourceFile = `${req.uuid}.${extension}`;
        const upload = {
            uuid: req.uuid,
            folderUUID: req.folderUUID,
            address,
            filename,
            extension,
        };
        VideoDAO.create(upload).then(() => {
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

export default UploadFS;
