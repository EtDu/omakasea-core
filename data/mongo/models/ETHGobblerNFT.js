import mongoose from "mongoose";
import ETHGobblerSchema from "../schemas/ETHGobblerSchema";

const schema = new mongoose.Schema(ETHGobblerSchema);
const ETHGobbler = mongoose.model("ETHGobblers", schema);

export default ETHGobbler;
