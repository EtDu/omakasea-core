import mongoose from "mongoose";
import GeneralTwitterWhitelistSchema from "../schemas/GeneralTwitterWhitelistSchema.js";

const schema = new mongoose.Schema(GeneralTwitterWhitelistSchema);
const TwitterWhitelist = mongoose.model("TwitterWhitelist", schema);

export default TwitterWhitelist;
