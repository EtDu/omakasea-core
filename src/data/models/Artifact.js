const mongoose = require("mongoose");
const ArtifactSchema = require("../schemas/ArtifactSchema");

const artifactSchema = new mongoose.Schema(ArtifactSchema);
const NFT = mongoose.model("Artifact", artifactSchema);

module.exports = NFT;
