const fs = require("fs");
const path = require("path");
const ipfsClient = require("ipfs-http-client").create();

const FileSystem = require("../../util/FileSystem");
const ArtifactDAO = require("../data/dao/ArtifactDAO");

class IPFS {
    static uploadFile(fPath, metadata) {
        return new Promise((resolve, reject) => {
            const content = fs.readFileSync(fPath);
            const name = metadata.name;
            ipfsClient
                .add({ path: name, content }, { pin: true })
                .then((result) => {
                    metadata.image = `ipfs://${result.cid}`;
                    const payload = {
                        path: metadata.name,
                        content: JSON.stringify(metadata),
                    };
                    console.log(payload);
                    resolve(payload);
                });
        });
    }

    static uploadMetadata(metadata) {
        return new Promise((resolve, reject) => {
            ipfsClient
                .add(metadata, { wrapWithDirectory: true, pin: true })
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }

    static uploadCollection(uploadId) {
        return new Promise((resolve, reject) => {
            const files = FileSystem.getGenerated(uploadId);

            const uids = [];
            const fileIndex = {};

            for (const f of files) {
                uids.push(f.fName);
                fileIndex[f.fName] = f;
            }

            ArtifactDAO.getMany({ uid: uids }).then((artifacts) => {
                const metadata = {};
                for (const artifact of artifacts) {
                    let collection = null;
                    const attributes = [];
                    for (const trait of artifact.traits) {
                        const toks = trait.split(path.sep);
                        attributes.push({
                            trait_type: toks[1],
                            value: toks[2].split("#")[0],
                        });
                        collection = toks[0];
                    }

                    metadata[artifact.uid] = {
                        date: Date.now(),
                        collection,
                        name: `${collection} #${artifact.sequence}`,
                        image: undefined,
                        attributes,
                    };
                }

                const uploads = [];

                for (const uid of Object.keys(metadata)) {
                    const fPath = fileIndex[uid].fPath;
                    const data = metadata[uid];
                    uploads.push(IPFS.uploadFile(fPath, data));
                }

                Promise.all(uploads).then((metadata) => {
                    IPFS.uploadMetadata(metadata).then((result) => {
                        resolve(result);
                    });
                });
            });
        });
    }
}

module.exports = IPFS;
