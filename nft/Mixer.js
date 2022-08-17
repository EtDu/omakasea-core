const md5 = require("blueimp-md5");

const MAX_RETRIES = 10000;

class Mixer {
  static isValid(resource) {
    for (const name of resource.nameIndex) {
      const attribute = resource.attributes[name];
      if (attribute.total === 0) {
        return false;
      }
    }
    return true;
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

        isValid = Mixer.isValid(resource);
      }

      resolve(specs);
    });
  }

  static spawn(resource) {
    const duration = {};
    let traits = [];
    let score = 0;
    let isGif = false;

    for (const name of resource.nameIndex) {
      const attribute = resource.attributes[name];
      attribute.total -= 1;

      const trait = Mixer.getRandom(attribute.traits);
      score += trait.rarity.total;
      traits.push({
        attribute: name,
        name: trait.name,
        path: trait.path,
      });

      if (trait.duration !== undefined) {
        const d = trait.duration;
        duration[d] = duration[d] ? duration[d] + 1 : 1;
        isGif = true;
      }
    }

    const isAligned = !(Object.keys(duration).length > 1);
    const uid = md5(JSON.stringify(traits));

    const spec = {
      uid,
      score,
      traits,
      isGif,
    };

    return {
      isAligned,
      spec,
    };
  }

  static getRandom(traits) {
    let trait = undefined;

    const pool = traits.filter((t) => t.rarity.count > 0);
    if (pool.length > 0) {
      const i = Math.floor(Math.random() * pool.length);
      trait = pool[i];

      for (const t of traits) {
        if (t.name === trait.name) {
          t.rarity.count -= 1;
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
          aTrait.rarity.count++;
        }
      }
    }
    return resource;
  }
}

module.exports = Mixer;
