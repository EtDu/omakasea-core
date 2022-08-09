const Sender = require("../redis/Sender");
const MongoDB = require("../data/MongoDB");
const CollectionDAO = require("../data/dao/CollectionDAO");
const ArtifactDAO = require("../data/dao/ArtifactDAO");

const PROTOCOL = require("../data/Protocol");

const FileSystem = require("../util/FileSystem");

const Mixer = require("./Mixer");
const Maker = require("./Maker");

const Resource = require("./Resource");

const UPLOAD_DIR = process.env.UPLOAD_DIR;
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
        const uploads = Object.keys(doc.uploads);
        this.pending = uploads.length;
        for (const uploadId of uploads) {
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
    Resource.create(uploadId, doc.uploads[uploadId]).then((resources) => {
      Mixer.create(2000, resources.pool).then((artifacts) => {
        ArtifactDAO.insertMany(uploadId, artifacts).then(() => {
          CollectionDAO.saveIndexes(this.auth, uploadId, resources).then(() => {
            const payload = { ...this.auth };
            payload.collection = {
              uploadId,
              specs: artifacts,
            };
            this.sender.to(process.env.NFT_IMAGE, payload).then(() => {
              this.finalize();
            });
          });
        });
      });
    });
  }

  resPreview(uploadId, dimensions) {
    ArtifactDAO.getActive(uploadId)
      .then((artifacts) => {
        const payload = { ...this.auth };
        payload.opcode = PROTOCOL.PREVIEW;
        payload.collection = {
          dimensions,
          uploadId,
          specs: artifacts,
        };

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
        const pool = Mixer.recycle(
          collection.resources[uploadId].pool,
          artifact
        );

        Mixer.create(1, pool).then((generated) => {
          const updated = generated[0];

          updated.sequence = artifact.sequence;
          updated.uploadId = artifact.uploadId;

          collection.resources[uploadId].pool = pool;
          collection.markModified("resources");

          CollectionDAO.save(collection).then((col) => {
            ArtifactDAO.delete(artifact);
            ArtifactDAO.insertOne(updated).then(() => {
              const dimensions = col.resources[uploadId].dimensions;
              this.resPreview(uploadId, dimensions);
            });
          });
        });
      });
    });
  }

  reqGenerate() {
    CollectionDAO.get(this.auth).then((collection) => {
      const uploadIds = Object.keys(collection.generated);
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
          const spec = { outputDir, uploadId, resource };
          Maker.generate(spec, artifacts, () => {
            generated++;
            console.log(`${generated} / ${total}`);
            this.finalize();
          });
        });
      }
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
