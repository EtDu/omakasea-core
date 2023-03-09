import mongoose from "mongoose";
import ETHGobblersEffectSchema from "../schemas/ETHGobblersEffectSchema.js";

const schema = new mongoose.Schema(ETHGobblersEffectSchema);
const ETHGobblerseEffect = mongoose.model("ETHGobblerseEffect", schema);

export default ETHGobblerseEffect;
