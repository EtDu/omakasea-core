const path = require("path");
const sharp = require("sharp");

const ROOT = process.env.UPLOAD_DIR;

class Resource {
    static getDimensions(data) {
        const meta = {
            width: data.width,
            height: data.height,
        };

        if (data.format === "gif") {
            meta.duration =
                (data.delay.reduce((a, b) => a + b, 0) / data.delay.length) *
                data.pages;
        }
        return meta;
    }

    static normalize(freq) {
        let max = 0;
        let dimension = undefined;

        Object.keys(freq).forEach((key) => {
            if (freq[key] > max) {
                max = freq[key];
                dimension = key;
            }
        });

        return Number(dimension);
    }

    static getFrequency(file) {
        const count = Number(file.split("#")[1].split(".")[0]);
        return { file, count };
    }

    static getMetadata(path, file, width, height) {
        return new Promise((resolve, reject) => {
            sharp(path)
                .metadata()
                .then((data) => {
                    const meta = Resource.getDimensions(data);
                    width[meta.width] = width[meta.width]
                        ? width[meta.width] + 1
                        : 1;
                    height[meta.height] = height[meta.height]
                        ? height[meta.height] + 1
                        : 1;
                    if (meta.duration) {
                        file.duration = meta.duration;
                    }

                    resolve({ file, width, height });
                });
        });
    }

    static create(uploadId, files) {
        return new Promise((resolve, reject) => {
            const width = {};
            const height = {};
            const pool = [];

            let extractionTotal = 0;
            let extractionCount = 0;

            for (const name of Object.keys(files).sort()) {
                const resource = {
                    name,
                    total: 0,
                    files: [],
                };

                extractionTotal += files[name].length;
                let resourceCount = 0;
                for (const file of files[name]) {
                    const f = Resource.getFrequency(file);
                    const path = `${ROOT}/${uploadId}/${name}/${f.file}`;
                    Resource.getMetadata(path, f, width, height).then(
                        ({ file, width, height }) => {
                            resource.files.push(file);
                            resource.total += file.count;

                            resourceCount++;
                            if (resourceCount === files[name].length) {
                                pool.push(resource);
                            }

                            extractionCount++;
                            if (extractionCount === extractionTotal) {
                                pool.sort((a, b) => {
                                    if (a.name > b.name) {
                                        return 1;
                                    } else if (a.name < b.name) {
                                        return -1;
                                    }
                                    return 0;
                                });
                                resolve({
                                    dimensions: {
                                        width: Resource.normalize(width),
                                        height: Resource.normalize(height),
                                    },
                                    pool,
                                });
                            }
                        }
                    );
                }
            }
        });
    }

    static getPathIndex(paths) {
        const tmp = {};
        for (const p of paths) {
            const fp = p.split(path.sep);
            const file = fp.pop();
            const dir = fp.join(path.sep);
            if (tmp[dir] === undefined) {
                tmp[dir] = [];
            }

            tmp[dir].push(file);
        }

        const index = {};

        for (const key of Object.keys(tmp).sort()) {
            index[key] = tmp[key].sort();
        }

        return index;
    }
}

module.exports = Resource;
