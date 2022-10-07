import mongoose from "mongoose";
import ArtifactSchema from "../schemas/ArtifactSchema.js";

const artifactSchema = new mongoose.Schema(ArtifactSchema);
const NFT = mongoose.model("Artifact", artifactSchema);

export default NFT;
