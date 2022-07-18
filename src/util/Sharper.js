const fs = require("fs");
const sharp = require("sharp");

class Sharper {
    static metadata(srcDir, specs) {
        const spec = specs.pop();
        const result = Sharper.toAsset(srcDir, spec.assets[0]);
        const head = result.asset.input;

        const assets = [result.asset];
        const metadata = [sharp(result.asset.input).metadata()];

        let hasGif = result.isGif;

        let tail = [];
        spec.assets.slice(1).forEach((f) => {
            const { isGif, asset, meta } = Sharper.toAsset(srcDir, f);
            assets.push(asset);
            metadata.push(meta);
            tail.push(asset);

            hasGif = hasGif || isGif;
        });

        return {
            head,
            tail,
            assets,
            metadata,
            hasGif,
            uid: spec.uid,
        };
    }

    static toAsset(loadSrc, file) {
        const path = `${loadSrc}/${file}`;
        const input = fs.readFileSync(path);
        const isGif = file.includes(".gif");
        const meta = sharp(input).metadata();

        const asset = {
            input,
            tile: isGif ? false : true,
            gravity: "northwest",
            animated: isGif ? true : false,
            limitInputPixels: 2684026890,
        };

        return { isGif, asset, meta };
    }

    static png(dir, data, next = null) {
        const { head, tail, uid } = data;
        const imagePath = `${dir}/${uid}.png`;
        sharp(head)
            .composite(tail)
            .toFile(imagePath)
            .then(() => {
                if (next !== null) {
                    next(imagePath);
                }
            });
    }

    static gif(dir, data, next = null) {
        const { dimensions, images, uid } = data;
        const imagePath = `${dir}/${uid}.gif`;
        sharp(Sharper.combine(dimensions))
            .composite(images)
            .toFile(imagePath)
            .then(() => {
                if (next !== null) {
                    next(imagePath);
                }
            });
    }

    static normalize(assets, metadata) {
        return new Promise((resolve, reject) => {
            Promise.all(metadata).then((data) => {
                const dimensions = Sharper.getDimensions(data);
                if (dimensions.consistent) {
                    if (dimensions.reqResize) {
                        const images = [];
                        const resized = [];

                        for (let i = 0; i < data.length; i++) {
                            const d = data[i];
                            const asset = assets[i];
                            let resize = undefined;

                            if (d.pages !== undefined) {
                                resize = sharp(asset.input, {
                                    pages: -1,
                                    limitInputPixels: 2684026890,
                                })
                                    .resize({
                                        width: dimensions.width,
                                        height: dimensions.height,
                                    })
                                    .toBuffer();
                            } else {
                                resize = sharp(asset.input)
                                    .resize({
                                        width: dimensions.width,
                                        height: dimensions.height,
                                    })
                                    .toBuffer();
                            }

                            resized.push(resize);
                        }

                        Promise.all(resized).then((resized) => {
                            for (let i = 0; i < resized.length; i++) {
                                assets[i].input = resized[i];
                                images.push(assets[i]);
                            }

                            resolve({ dimensions, images });
                        });
                    } else {
                        resolve({ dimensions, assets });
                    }
                } else {
                    reject({ error: "INCONSISTENT SIZE" });
                }
            });
        });
    }

    static getMaxFrequency(freq) {
        let max = 0;
        let result = undefined;

        for (const key of Object.keys(freq)) {
            const count = freq[key];
            if (count > max) {
                result = key;
                max = count;
            }
        }

        return Number(result);
    }

    static getDimensions(data) {
        const widthFreq = {};
        const heightFreq = {};
        const sizes = [];
        let pages = 0;

        for (const d of data) {
            widthFreq[d.width] = widthFreq[d.width]
                ? widthFreq[d.width] + 1
                : 1;
            heightFreq[d.height] = heightFreq[d.height]
                ? heightFreq[d.height] + 1
                : 1;

            if (d.pages !== undefined) {
                sizes.push(d.pages);
                if (d.pages > pages) {
                    pages = d.pages;
                }
            }
        }

        const consistent =
            sizes.length === 0 || sizes.every((val, i, arr) => val === arr[0]);

        const width = Sharper.getMaxFrequency(widthFreq);
        const height = Sharper.getMaxFrequency(heightFreq);

        const reqResize =
            Object.keys(widthFreq).length > 0 ||
            Object.keys(heightFreq).length > 0;

        const dimensions = {
            consistent,
            reqResize,
            width,
            height,
            pages,
        };

        return dimensions;
    }

    static combine(dimensions) {
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
