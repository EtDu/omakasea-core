const Sender = require("../redis/Sender");
const MongoDB = require("../data/MongoDB");
const CollectionDAO = require("../data/dao/CollectionDAO");
const ArtifactDAO = require("../data/dao/ArtifactDAO");

const PROTOCOL = require("../data/Protocol");

const FileSystem = require("../util/FileSystem");

const Mixer = require("./Mixer");
const Maker = require("./Maker");

const Resource = require("./Resource");

const GridFS = require("../data/GridFS");

const GENERATED_DIR = process.env.GENERATED_DIR;

class Builder {
  constructor(auth) {
    this.auth = auth;
    this.total = 0;
    this.pending = 0;

    this.sender = new Sender();
  }

  reqPreview() {
    CollectionDAO.get(this.auth)
      .then((doc) => {
        const resources = Object.keys(doc.resources);
        this.pending = resources.length;
        for (const uploadId of resources) {
          if (doc.generated[uploadId]) {
            const dimensions = doc.resources[uploadId].dimensions;
            this.resPreview(uploadId, dimensions);
          } else {
            this.createPreview(uploadId, doc);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        this.exit(400);
      });
  }

  createPreview(uploadId, doc) {
    GridFS.connect(process.env.OMAKASEA_URL).then(() => {
      console.log("CONNECTED");
      Resource.create(doc.resources[uploadId]).then((resource) => {
        console.log("RESOURCE CREATED");
        Mixer.create(2000, resource).then((artifacts) => {
          ArtifactDAO.insertMany(uploadId, artifacts).then(() => {
            CollectionDAO.saveIndexes(this.auth, uploadId, resource).then(
              () => {
                const payload = this.prepPreview(uploadId, artifacts);
                this.sender.to(process.env.NFT_IMAGE, payload).then(() => {
                  this.finalize();
                });
              }
            );
          });
        });
      });
    });
  }

  prepPreview(uploadId, artifacts) {
    const payload = { ...this.auth };
    const specs = [];
    for (const artifact of artifacts) {
      const traits = [];
      for (const trait of artifact.traits) {
        traits.push(trait.path);
      }
      specs.push({
        uid: artifact.uid,
        traits,
      });
    }
    payload.collection = {
      uploadId,
      specs,
    };

    payload.opcode = PROTOCOL.PREVIEW;
    return payload;
  }

  resPreview(uploadId) {
    ArtifactDAO.getActive(uploadId)
      .then((artifacts) => {
        const payload = this.prepPreview(uploadId, artifacts);
        this.sender.to(process.env.NFT_IMAGE, payload).then(() => {
          this.finalize();
        });
      })
      .catch((error) => {
        console.log(error);
        this.exit(400);
      });
  }

  reqRedraw() {
    const target = this.auth.target;
    const [uploadId, uid] = target.split("/");
    ArtifactDAO.get(uploadId, uid).then((artifact) => {
      CollectionDAO.get(this.auth).then((collection) => {
        Mixer.recycle(collection.resources[uploadId], artifact);
        Mixer.create(1, collection.resources[uploadId]).then((generated) => {
          const updated = generated[0];
          updated.sequence = artifact.sequence;
          updated.uploadId = artifact.uploadId;

          collection.markModified("resources");
          CollectionDAO.save(collection).then(() => {
            ArtifactDAO.delete(artifact).then(() => {
              ArtifactDAO.insertOne(updated).then(() => {
                this.resPreview(uploadId);
              });
            });
          });
        });
      });
    });
  }

  reqGenerate() {
    GridFS.connect(process.env.OMAKASEA_URL).then(() => {
      CollectionDAO.get(this.auth).then((collection) => {
        const uploadIds = [];
        for (const uploadId of Object.keys(collection.generated)) {
          if (collection.generated[uploadId]) {
            uploadIds.push(uploadId);
          }
        }

        let total = 0;
        let generated = 0;
        for (const uploadId of uploadIds) {
          const outputDir = FileSystem.createGenerateDir(
            `${GENERATED_DIR}/${uploadId}`
          );
          const resource = collection.resources[uploadId];
          ArtifactDAO.search(uploadId).then((artifacts) => {
            total += artifacts.length;
            this.pending += artifacts.length;
            const spec = { outputDir, uploadId };
            Maker.generate(spec, resource, artifacts, () => {
              generated++;
              console.log(`${generated} / ${total}`);
              this.finalize();
            });
          });
        }
      });
    });
  }

  start() {
    if (this.auth.opcode === PROTOCOL.PREVIEW) {
      this.reqPreview();
    } else if (this.auth.opcode === PROTOCOL.REDRAW) {
      this.pending = 1;
      this.reqRedraw();
    } else if (this.auth.opcode === PROTOCOL.GENERATE) {
      console.log(process.env.UPLOAD_DIR);
      this.reqGenerate();
    }
  }

  finalize() {
    this.pending--;
    console.log(this.pending);
    if (this.pending <= 0) {
      console.log("DONE");
      this.exit(200);
    }
  }

  exit(status) {
    this.auth.status = status;
    this.auth.total = this.total;

    this.sender.to(process.env.NFT_DONE, this.auth).then(() => {
      console.log("EXIT\n");
      MongoDB.disconnect();
      process.exit();
    });
  }
}

process.on("message", (auth) => {
  MongoDB.connect(process.env.OMAKASEA_URL).then(() => {
    process.title = `[${auth.sock}] BUILD`;
    const BUILDER = new Builder(auth);
    BUILDER.start();
  });
});
