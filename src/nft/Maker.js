const Resource = require("./Resource");
const Sharper = require("./Sharper");

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const GENERATED_DIR = process.env.GENERATED_DIR;

class Maker {
    static generate(uploadId, resource, artifacts, callback) {
        const __NEXT__ = () => {
            Maker.generate(uploadId, resource, artifacts, callback);
            callback();
        };

        if (artifacts.length > 0) {
            const current = artifacts.pop();
            const data = Resource.getData(current, resource);
            Sharper.create(uploadId, data).then(() => {
                __NEXT__();
            });
        }
    }
}

module.exports = Maker;

/*

class Maker {
    constructor(collection) {
        this.specs = collection.specs;
        this.loadSrc = `${UPLOAD_DIR}/${collection.path}`;
        this.outPath = `${GENERATED_DIR}/${collection.path}`;
        FileSystem.createDir(this.outPath);
    }

    generate(finalize) {
        fs.readdir(this.outPath, (err, files) => {
            const batch = `BATCH_${files.length + 1}`;
            const batchDir = `${this.outPath}/${batch}`;

            FileSystem.createDir(batchDir);
            this.__createNFT__(batchDir, this.specs, finalize);
        });
    }

    __createNFT__(batchDir, specs, finalize) {
        const __next = (image) => {
            this.__createNFT__(batchDir, specs, finalize);
            finalize(image);
        };

        if (specs.length > 0) {
            const result = Sharper.metadata(this.loadSrc, specs);

            if (result.hasGif) {
                Sharper.normalize(result.assets, result.metadata)
                    .then((data) => {
                        data.uid = result.uid;
                        Sharper.gif(batchDir, data, __next);
                    })
                    .catch((error) => {
                        console.log(error);
                        __next();
                    });
            } else {
                Sharper.png(batchDir, result, __next);
            }
        }
    }
}

module.exports = Maker;

*/
