const path = require("path");
const sharp = require("sharp");

const FileSystem = require("../util/FileSystem");

const UPLOAD_DIR = process.env.UPLOAD_DIR;

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
          isGif = FileSystem.isGif(artifact.traits[i]);
        }

        const file = Resource.find(artifact.traits[i], resource.pool[i]);

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

  static getMetadata(path, trait, width = {}, height = {}) {
    return new Promise((resolve, reject) => {
      sharp(path)
        .metadata()
        .then((data) => {
          const meta = Resource.getDimensions(data);
          width[meta.width] = width[meta.width] ? width[meta.width] + 1 : 1;
          height[meta.height] = height[meta.height]
            ? height[meta.height] + 1
            : 1;
          if (meta.duration) {
            trait.duration = meta.duration;
            trait.pages = meta.pages;
          }

          resolve({ trait, width, height });
        });
    });
  }

  static toIndex(nftClass) {
    return {
      nameIndex: nftClass.nameIndex,
      attributes: nftClass.attributes,
    };
  }

  static create(uploadId, resource) {
    return new Promise((resolve, reject) => {
      const width = {};
      const height = {};
      const pool = [];

      let count = 0;
      let total = 0;
      for (const name of resource.nameIndex) {
        const updated = [];
        const current = resource.attributes[name];
        total += current.traits.length;

        for (const trait of current.traits) {
          const path = `${UPLOAD_DIR}/${uploadId}/${trait.path}`;
          Resource.getMetadata(path, trait, width, height).then(
            ({ trait, width, height }) => {
              updated.push(trait);
              if (updated.length === current.length) {
                resource.attributes[name] = updated;
              }

              count++;
              if (count === total) {
                resource.dimensions = {
                  width: Resource.normalize(width),
                  height: Resource.normalize(height),
                };
                resolve(resource);
              }
            }
          );
        }
      }
    });
  }
}

module.exports = Resource;
