import mongoose from "mongoose";
import ETHGobblersConsumeSchema from "../schemas/ETHGobblersConsumeSchema.js";

const schema = new mongoose.Schema(ETHGobblersConsumeSchema);
const ETHGobblersConsume = mongoose.model("ETHGobblersConsume", schema);

export default ETHGobblersConsume;
