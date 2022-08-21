const Resource = require("./Resource");
const Sharper = require("./Sharper");

class Maker {
  static generate(spec, resource, artifacts, callback) {
    const __NEXT__ = () => {
      Maker.generate(spec, resource, artifacts, callback);
      callback();
    };

    if (artifacts.length > 0) {
      const current = artifacts.pop();
      const data = Resource.getData(current, resource);

      Sharper.create(spec, data).then(() => {
        __NEXT__();
      });
    }
  }
}

module.exports = Maker;
