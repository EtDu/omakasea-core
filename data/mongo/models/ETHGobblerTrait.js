import mongoose from "mongoose";
import ETHGobblerTraitSchema from "../schemas/ETHGobblerTraitSchema.js";

const schema = new mongoose.Schema(ETHGobblerTraitSchema);
const ETHGobblerTrait = mongoose.model("ETHGobblerTrait", schema);

export default ETHGobblerTrait;
