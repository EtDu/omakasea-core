import mongoose from "mongoose";
import ETHGobblerConsumeSchema from "../schemas/ETHGobblerConsumeSchema.js";

const schema = new mongoose.Schema(ETHGobblerConsumeSchema);
const ETHGobblerConsume = mongoose.model("ETHGobblerConsume", schema);

export default ETHGobblerConsume;
