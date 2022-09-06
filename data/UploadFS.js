import multer from "multer";

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./_uploads");
    },
    filename: (req, file, callback) => {
        console.log(req);
        callback(null, file.originalname);
    },
});

const UploadFS = multer({ storage: fileStorageEngine });
Object.freeze(UploadFS);
export default UploadFS;
