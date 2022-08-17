const fs = require("fs");
const sharp = require("sharp");

const FileSystem = require("../util/FileSystem");

const UPLOAD_DIR = process.env.UPLOAD_DIR;

class Sharper {
  static toAsset(fPath) {
    const input = fs.readFileSync(fPath);
    const isGif = FileSystem.isGif(fPath);
    return {
      input,
      tile: isGif ? false : true,
      gravity: "northwest",
      animated: isGif ? true : false,
      limitInputPixels: 2684026890,
    };
  }

  static extract(uploadId, data) {
    return new Promise((resolve, reject) => {
      const assets = [];
      const metadata = [];

      for (const file of data.files) {
        const fPath = `${UPLOAD_DIR}/${uploadId}/${file}`;
        const asset = Sharper.toAsset(fPath);
        assets.push(asset);
        metadata.push(sharp(asset.input).metadata());
      }

      resolve({ assets, metadata });
    });
  }

  static create(spec, data) {
    return new Promise((resolve, reject) => {
      if (data.isGif) {
        Sharper.createGif(spec, data).then(() => {
          resolve();
        });
      } else {
        Sharper.createPng(spec, data).then(() => {
          resolve();
        });
      }
    });
  }

  static createPng(spec, data) {
    return new Promise((resolve, reject) => {
      Sharper.extract(spec.uploadId, data).then((results) => {
        Sharper.normalize(data.dimensions, results).then((images) => {
          Sharper.writePng(spec, data, images).then(() => {
            resolve();
          });
        });
      });
    });
  }

  static createGif(spec, data) {
    return new Promise((resolve, reject) => {
      Sharper.extract(spec.uploadId, data).then((results) => {
        Sharper.normalize(data.dimensions, results).then((images) => {
          Sharper.writeGif(spec, data, images).then(() => {
            resolve();
          });
        });
      });
    });
  }

  static normalize(dimensions, results) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      Promise.all(results.metadata).then((metadata) => {
        for (let i = 0; i < metadata.length; i++) {
          const meta = metadata[i];
          const asset = results.assets[i];
          let resized = undefined;

          if (meta.format === "gif") {
            resized = sharp(asset.input, {
              pages: -1,
              limitInputPixels: 2684026890,
            })
              .resize({
                width: dimensions.width,
                height: dimensions.height,
              })
              .toBuffer();
          } else {
            resized = sharp(asset.input)
              .resize({
                width: dimensions.width,
                height: dimensions.height,
              })
              .toBuffer();
          }

          buffers.push(resized);
        }

        Promise.all(buffers).then((input) => {
          const images = [];
          for (let i = 0; i < input.length; i++) {
            results.assets[i].input = input[i];
            images.push(results.assets[i]);
          }
          resolve(images);
        });
      });
    });
  }

  static writePng(spec, data, images) {
    return new Promise((resolve, reject) => {
      const imagefPath = `${spec.outputDir}/${data.uid}.png`;
      const head = images.shift();
      sharp(head.input)
        .composite(images)
        .toFile(imagefPath)
        .then(() => {
          resolve();
        });
    });
  }

  static writeGif(spec, data, images) {
    return new Promise((resolve, reject) => {
      const imagefPath = `${spec.outputDir}/${data.uid}.gif`;
      const base = Sharper.baseGif(data.dimensions);
      sharp(base)
        .composite(images)
        .toFile(imagefPath)
        .then(() => {
          resolve();
        });
    });
  }

  static baseGif(dimensions) {
    const { width, height, pages } = dimensions;
    return {
      create: {
        width: width,
        height: height * pages,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
      animated: true,
      limitInputPixels: 2684026890,
    };
  }
}

module.exports = Sharper;
