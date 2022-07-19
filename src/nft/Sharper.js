const fs = require("fs");
const sharp = require("sharp");

const UPLOAD_DIR = "../omakasea-backend-new/web/public/__tmp__/_uploads";
const GENERATE_DIR = "./__exp__";

class Sharper {
    static toAsset(path) {
        const input = fs.readFileSync(path);
        const isGif = path.includes("gif");
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
                const path = `${UPLOAD_DIR}/${uploadId}/${file}`;
                const asset = Sharper.toAsset(path);
                assets.push(asset);
                metadata.push(sharp(asset.input).metadata());
            }

            resolve({ assets, metadata });
        });
    }

    static makePng(uploadId, data) {
        return new Promise((resolve, reject) => {
            Sharper.extract(uploadId, data).then((results) => {
                Sharper.normalize(data.dimensions, results).then((images) => {
                    Sharper.writePng(data, images).then(() => {
                        resolve();
                    });
                });
            });
        });
    }

    static makeGif(uploadId, data) {
        return new Promise((resolve, reject) => {
            Sharper.extract(uploadId, data).then((results) => {
                Sharper.normalize(data.dimensions, results).then((images) => {
                    Sharper.writeGif(data, images).then(() => {
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

    static writePng(data, images) {
        return new Promise((resolve, reject) => {
            const imagePath = `${GENERATE_DIR}/${data.uid}.png`;
            const head = images.shift();
            sharp(head.input)
                .composite(images)
                .toFile(imagePath)
                .then(() => {
                    resolve();
                });
        });
    }

    static writeGif(data, images) {
        return new Promise((resolve, reject) => {
            const imagePath = `${GENERATE_DIR}/${data.uid}.gif`;
            const base = Sharper.baseGif(data.dimensions);
            sharp(base)
                .composite(images)
                .toFile(imagePath)
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
                background: "#0000ff",
            },
            animated: true,
            limitInputPixels: 2684026890,
        };
    }
}

module.exports = Sharper;
