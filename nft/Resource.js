const sharp = require("sharp");

const FileSystem = require("../util/FileSystem");
const GridFS = require("../data/GridFS");

const UPLOAD_DIR = process.env.UPLOAD_DIR;

class Resource {
  static getPages(trait, resource) {
    for (const name of resource.nameIndex) {
      for (const t of resource.attributes[name].traits) {
        if (t.name === trait.name) {
          return t.pages ? t.pages : 0;
        }
      }
    }
  }

  static getData(artifact, resource) {
    const uid = artifact.uid;
    let isGif = false;
    let pages = 0;

    const files = [];
    if (artifact.traits.length === Object.keys(resource.attributes).length) {
      for (let i = 0; i < artifact.traits.length; i++) {
        if (!isGif) {
          isGif = FileSystem.isGif(artifact.traits[i].path);
        }

        const trait = artifact.traits[i];

        files.push(trait.path);
        if (artifact.isGif) {
          const rPages = Resource.getPages(trait, resource);
          pages = rPages > pages ? rPages : pages;
        }
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

  static getMetadata(trait, width = {}, height = {}) {
    return new Promise((resolve, reject) => {
      GridFS.getChunks(trait.key).then((buffer) => {
        sharp(buffer)
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
    });
  }

  static toIndex(nftClass) {
    return {
      nameIndex: nftClass.nameIndex,
      attributes: nftClass.attributes,
    };
  }

  static create(resource) {
    return new Promise((resolve, reject) => {
      const width = {};
      const height = {};

      let count = 0;
      let total = 0;
      for (const name of resource.nameIndex) {
        const updated = [];
        const current = resource.attributes[name];
        total += current.traits.length;

        for (const trait of current.traits) {
          Resource.getMetadata(trait, width, height).then(
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
