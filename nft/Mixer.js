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

  static create(count, resource) {
    return new Promise((resolve, reject) => {
      let isValid = true;
      let retries = 0;
      let created = new Set();
      const specs = [];
      for (let i = 0; i < count; i++) {
        if (isValid && retries < MAX_RETRIES) {
          const result = Mixer.spawn(resource);
          isValid = result.isValid;

          const canCreate = !created.has(result.spec.uid) && isValid;
          if (canCreate && result.isAligned) {
            specs.push(result.spec);
          } else if (isValid) {
            Mixer.recycle(resource, result.spec);
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

  static spawn(resource) {
    const duration = {};
    let traits = [];
    let isValid = true;
    let rating = 0;

    for (const name of resource.nameIndex) {
      const attribute = resource.attributes[name];
      if (attribute.total > 0) {
        attribute.total -= 1;

        const trait = Mixer.getRandom(attribute.traits);
        rating += trait.rarity;
        traits.push({
          attribute: name,
          name: trait.name,
          path: trait.path,
        });
        if (trait.duration !== undefined) {
          const d = trait.duration;
          duration[d] = duration[d] ? duration[d] + 1 : 1;
        }
      } else {
        isValid = false;
      }
    }

    const isAligned = !(Object.keys(duration).length > 1);
    const uid = sha1(JSON.stringify(traits));

    const spec = {
      uid,
      rating,
      traits,
    };

    return {
      isValid,
      isAligned,
      spec,
    };
  }

  static getRandom(traits) {
    let trait = undefined;

    const pool = traits.filter((t) => t.rarity > 0);
    if (pool.length > 0) {
      const i = Math.floor(Math.random() * pool.length);
      trait = pool[i];

      for (const t of traits) {
        if (t.name === trait.name) {
          t.rarity -= 1;
        }
      }
    }

    return trait;
  }

  static recycle(resource, spec) {
    for (const sTrait of spec.traits) {
      const attribute = resource.attributes[sTrait.attribute];
      attribute.total++;
      for (const aTrait of attribute.traits) {
        if (sTrait.name === aTrait.name) {
          aTrait.rarity++;
        }
      }
    }
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
