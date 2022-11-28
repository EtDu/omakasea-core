import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import multer from "multer";

import VideoDAO from "../mongo/dao/VideoDAO.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR;

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const tokenId = req.session.tokenId;

        const filename = file.originalname;
        const toks = filename.split(".");
        const extension = toks[toks.length - 1];

        req.uuid = crypto.randomUUID();
        req.folderUUID = req.headers.folderuuid;
        const sourceFile = `${req.uuid}.${extension}`;
        const upload = {
            uuid: req.uuid,
            folderUUID: req.folderUUID,
            tokenId,
            filename,
            extension,
        };

        VideoDAO.create(upload)
            .then(() => {
                cb(null, sourceFile);
            })
            .catch(() => {
                console.log(upload);
            });
    },
});

const UploadFS = multer({
    storage: fileStorageEngine,
    fileFilter: (req, file, cb) => {
        const message = req.headers.message;

        if (message !== null && message !== undefined) {
            req.authorized = true;
            cb(null, true);
        } else {
            req.authorized = false;
            cb(null, false);
        }
    },
});

export default UploadFS;
