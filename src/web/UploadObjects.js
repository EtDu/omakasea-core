const RANDSET = "0123456789abcdefghijklmnopqrstuvwxyz";

function deepCopy(obj) {
    return { ...obj };
}

function randomInt() {
    return Math.floor(Math.random() * Math.floor(RANDSET.length));
}

function uniqueAlphaNumericId(length = 24) {
    return Array.from({ length }, () => RANDSET[randomInt()]).join("");
}

class NFTClass {
    constructor() {
        const uploadID = uniqueAlphaNumericId();
        this.nftClass = {
            uploadID,
            nameIndex: [],
            attributes: {},
        };
    }

    setName(name) {
        this.nftClass.name = name;
    }

    setMaxSupply(maxSupply) {
        this.nftClass.maxSupply = maxSupply;
    }

    injectAttributes(paths, pathSep = "/") {
        const nameIndex = [];
        for (const path of paths) {
            const toks = path.split(pathSep);
            const name = toks.pop();
            const attr = toks.pop();

            if (this.nftClass.attributes[attr] === undefined) {
                this.nftClass.attributes[attr] = [];
            }

            nameIndex.push(attr);
            this.nftClass.attributes[attr].push({
                name,
                path,
                rarity: 0,
            });
        }

        this.nftClass.nameIndex = nameIndex.sort();
    }

    getAttribute(name) {
        return this.nftClass.attributes[name];
    }

    renameAttribute(name1, name2) {
        this.nftClass.attributes[name2] = deepCopy(
            this.nftClass.attributes[name1]
        );
        this.deleteAttribute(name1);
    }

    deleteAttribute(name) {
        this.nftClass.nameIndex = this.nftClass.nameIndex.filter(
            (n) => n !== name
        );
        delete this.nftClass.attributes[name];
    }

    updateAttribute(name, attrs) {
        this.nftClass.attributes[name] = attrs;
    }

    deleteTrait(attr, trait) {
        this.nftClass.attributes[attr] = this.nftClass.attributes[attr].filter(
            (tr) => tr.name !== trait
        );
    }

    renameTrait(attr, trait1, trait2) {
        const attrs = [];
        for (const tr of this.nftClass.attributes[attr]) {
            if (tr.name === trait1) {
                tr.name = trait2;
            }
        }

        this.nftClass.attributes[attr] = attrs;
    }
}

class NFTCollection {
    constructor() {
        this.nftCollection = {
            nftClasses: {},
        };
    }

    setName(name) {
        this.nftCollection.name = name;
    }

    setDescription(description) {
        this.nftCollection.description = description;
    }

    setSymbol(symbol) {
        this.nftCollection.symbol = symbol;
    }

    setPrice(price) {
        this.nftCollection.price = price;
    }

    addClass(nftClass) {
        this.nftCollection.nftClasses[nftClass.name] = nftClass;
    }

    getClass(name) {
        return this.nftClasses[name];
    }

    renameClass(name1, name2) {
        this.nftCollection.nftClasses[name2] = deepCopy(
            this.nftCollection.nftClasses[name1]
        );
        this.delClass(name1);
    }

    updateClass(nftClass) {
        this.addClass(nftClass);
    }

    deleteClass(name) {
        delete this.nftCollection.nftClasses[name];
    }
}

module.exports = {
    NFTClass,
    NFTCollection,
};
