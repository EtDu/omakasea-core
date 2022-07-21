const path = require("path");
const sharp = require("sharp");

const ROOT = process.env.UPLOAD_DIR;

class Resource {
    static find(trait, attr) {
        for (const f of attr.files) {
            if (trait.includes(f.file)) {
                const pages = f.pages ? f.pages : 0;
                return {
                    name: `${attr.name}/${f.file}`,
                    pages,
                };
            }
        }
    }

    static getData(artifact, resource) {
        const uid = artifact.uid;
        let isGif = false;
        let pages = 0;

        const files = [];
        if (artifact.traits.length === resource.pool.length) {
            for (let i = 0; i < artifact.traits.length; i++) {
                if (!isGif) {
                    isGif = artifact.traits[i].includes("gif");
                }

                const file = Resource.find(
                    artifact.traits[i],
                    resource.pool[i]
                );

                pages = file.pages > pages ? file.pages : pages;
                files.push(file.name);
            }

            const dimensions = { ...resource.dimensions };
            if (pages > 0) {
                dimensions.pages = pages;
            }

            return { uid, isGif, dimensions, files };
        }

        throw new Error("traits do not match resources");
    }

    static getDimensions(data) {
        const meta = {
            width: data.width,
            height: data.height,
        };

        if (data.format === "gif") {
            meta.duration =
                (data.delay.reduce((a, b) => a + b, 0) / data.delay.length) *
                data.pages;
            meta.pages = data.pages;
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

    static getMetadata(path, freq, width = {}, height = {}) {
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
                        freq.duration = meta.duration;
                        freq.pages = meta.pages;
                    }

                    resolve({ freq, width, height, data });
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
                        ({ freq, width, height }) => {
                            resource.files.push(freq);
                            resource.total += freq.count;

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
