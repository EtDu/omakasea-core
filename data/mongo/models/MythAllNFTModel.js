import mongoose from "mongoose";
import MythAllNFTSchema from "../schemas/MythAllNFTSchema.js";

const schema = new mongoose.Schema(MythAllNFTSchema);
const MythAllNFT = mongoose.model("MythAllNFTs", schema);

export default MythAllNFT;
