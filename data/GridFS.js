const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Authentication = require("../util/Authentication");

let GRID_FS = null;
let GRID_FS_BUCKET = null;

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
          bucketName: "traits",
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
const Uploader = multer({ storage: STORAGE, preservePath: true });
Object.freeze(Uploader);

class GridFS {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const conn = mongoose.createConnection(url);
      conn.once("open", () => {
        if (GRID_FS === null) {
          console.log("GRID FS INIT");
          GRID_FS = Grid(conn.db, mongoose.mongo);
          GRID_FS.collection("traits");
          GRID_FS_BUCKET = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "traits",
          });

          Object.freeze(GRID_FS);
          Object.freeze(GRID_FS_BUCKET);
        }
        resolve({ GRID_FS, GRID_FS_BUCKET });
      });
    });
  }
}

module.exports = { GridFS, Uploader };
