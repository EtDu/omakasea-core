import mongoose from "mongoose";
import ETHGobblerMetaSchema from "../schemas/ETHGobblerMetaSchema.js";

const schema = new mongoose.Schema(ETHGobblerMetaSchema);
const ETHGobblerMeta = mongoose.model("ETHGobblerMetadata", schema);

export default ETHGobblerMeta;
