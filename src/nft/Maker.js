const Resource = require("./Resource");
const Sharper = require("./Sharper");

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const GENERATED_DIR = process.env.GENERATED_DIR;

class Maker {
    static generate(spec, artifacts, callback) {
        const __NEXT__ = () => {
            Maker.generate(spec, artifacts, callback);
            callback();
        };

        if (artifacts.length > 0) {
            const current = artifacts.pop();
            const data = Resource.getData(current, spec.resource);
            Sharper.create(spec, data).then(() => {
                __NEXT__();
            });
        }
    }
}

module.exports = Maker;
