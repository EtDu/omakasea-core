import mongoose from "mongoose";
import ETHGobblerEffectSchema from "../schemas/ETHGobblerEffectSchema.js";

const schema = new mongoose.Schema(ETHGobblerEffectSchema);
const ETHGobblerEffect = mongoose.model("ETHGobblerEffect", schema);

export default ETHGobblerEffect;
