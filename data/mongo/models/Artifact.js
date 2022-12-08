import mongoose from "mongoose";
import ArtifactSchema from "../schemas/ArtifactSchema.js";

const schema = new mongoose.Schema(ArtifactSchema);
const NFT = mongoose.model("Artifact", schema);

export default NFT;
