import mongoose from "mongoose";
import ETHGobblerImageSchema from "../schemas/ETHGobblerImageSchema.js";

const schema = new mongoose.Schema(ETHGobblerImageSchema);
const ETHGobblerImage = mongoose.model("ETHGobblerImage", schema);

export default ETHGobblerImage;
