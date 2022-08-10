const path = require("path");
const sha1 = require("sha1");

const Resource = require("./Resource");

const MAX_RETRIES = 10000;

function getTrait(name, artifact) {
  let found = undefined;
  artifact.traits.forEach((trait) => {
    if (trait.includes(name)) {
      found = trait;
    }
  });
  return found;
}

class Mixer {
  static shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  static create(count, pool) {
    return new Promise((resolve, reject) => {
      let isValid = true;
      let retries = 0;
      let created = new Set();
      const specs = [];

      for (let i = 0; i < count; i++) {
        if (isValid && retries < MAX_RETRIES) {
          const result = Mixer.spawn(pool);
          const spec = result.spec;
          isValid = result.isValid;

          const pagesAligned = !(Object.keys(spec.duration).length > 1);

          const canCreate = !created.has(spec.uid) && isValid;

          if (canCreate && pagesAligned) {
            delete spec.duration;
            specs.push(spec);
          } else if (isValid) {
            pool = Mixer.recycle(pool, spec);
            retries++;
            i--;
          }
        } else {
          break;
        }
      }

      resolve(specs);
    });
  }

  static spawn(pool) {
    let isValid = true;
    const duration = {};
    let traits = [];
    for (const attribute of pool) {
      if (attribute.total > 0) {
        const records = attribute.files;
        const file = Mixer.getRandom(records);

        let total = 0;
        for (const f of records) {
          total += f.count;
        }

        if (file.duration !== undefined) {
          const d = file.duration;
          duration[d] = duration[d] ? duration[d] + 1 : 1;
        }

        attribute.total = total;
        traits.push(`${attribute.name}/${file.file}`);
      } else {
        isValid = false;
      }
    }

    traits = traits.sort();
    const uid = sha1(JSON.stringify(traits));
    const rating = traits.reduce(
      (i, f) => i + Resource.getFrequency(f).count,
      0
    );

    const spec = {
      duration,
      uid,
      rating,
      traits,
    };

    return { spec, isValid };
  }
  static getRandom(files) {
    let file = undefined;

    const pool = files.filter((f) => f.count > 0);
    if (pool.length > 0) {
      const i = Math.floor(Math.random() * pool.length);
      file = pool[i];

      for (const f of files) {
        if (f.file === file.file) {
          f.count -= 1;
        }
      }
    }

    return file;
  }

  static recycle(pool, artifact) {
    const updated = [];

    for (let i = 0; i < pool.length; i++) {
      const trait = { ...pool[i] };
      const current = Mixer.splitAsset(getTrait(trait.name, artifact));

      if (current.trait === trait.name) {
        trait.total++;

        for (const f of trait.files) {
          if (f.file === current.file) {
            f.count++;
          }
        }

        updated.push(trait);
      }
    }

    return updated;
  }

  static splitAsset(asset) {
    const toks = asset.split(path.sep);
    const file = toks.pop();
    const trait = toks.join(path.sep);

    return {
      trait,
      file,
    };
  }
}

module.exports = Mixer;
