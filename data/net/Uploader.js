import IPFS from "./IPFS.js";
import UploadDAO from "../mongo/dao/UploadDAO.js";

class Uploader {
    constructor() {
        this.pending = 0;
        this.current = null;
    }

    increment(callback = null) {
        if (this.current === null) {
            UploadDAO.search({
                isReady: true,
                isUploaded: false,
                isMerged: false,
            }).then((results) => {
                if (results.length > 0) {
                    this.pending = results.length;
                    this.current = results[0];
                }

                if (callback !== null) {
                    callback();
                }
            });
        }
    }

    upload() {
        this.increment(() => {
            this.__upload__();
        });
    }

    __upload__() {
        if (this.current !== null) {
            IPFS.upload(this.current, () => {
                this.current = null;
                this.upload();
            });
        }
    }
}

export default Uploader;
