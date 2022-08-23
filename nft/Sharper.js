const fs = require("fs");
const sharp = require("sharp");

const GridFS = require("../data/GridFS");

const UPLOAD_DIR = process.env.UPLOAD_DIR;

class Sharper {
  static toAsset(input, isGif) {
    return {
      input,
      tile: isGif ? false : true,
      gravity: "northwest",
      animated: isGif ? true : false,
      limitInputPixels: 2684026890,
    };
  }

  static extract(artifact) {
    return new Promise((resolve, reject) => {
      const assets = [];
      const metadata = [];
      let count = 0;
      for (const file of artifact.files) {
        count++;
        setTimeout(() => {
          GridFS.getChunks(file)
            .then((chunks) => {
              const asset = Sharper.toAsset(chunks.input, chunks.isGif);
              assets.push(asset);
              metadata.push(sharp(asset.input).metadata());

              if (metadata.length === artifact.files.length) {
                resolve({ assets, metadata });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }, 10 * count);
      }
    });
  }

  static create(spec, artifact) {
    return new Promise((resolve, reject) => {
      if (artifact.isGif) {
        Sharper.createGif(spec, artifact).then(() => {
          resolve();
        });
      } else {
        Sharper.createPng(spec, artifact).then(() => {
          resolve();
        });
      }
    });
  }

  static createGif(spec, artifact) {
    return new Promise((resolve, reject) => {
      Sharper.extract(artifact).then((results) => {
        Sharper.normalize(artifact.dimensions, results).then((images) => {
          Sharper.writeGif(spec, artifact, images).then(() => {
            resolve();
          });
        });
      });
    });
  }

  static createPng(spec, artifact) {
    return new Promise((resolve, reject) => {
      Sharper.extract(artifact).then((results) => {
        Sharper.normalize(artifact.dimensions, results).then((images) => {
          Sharper.writePng(spec, artifact, images).then(() => {
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
