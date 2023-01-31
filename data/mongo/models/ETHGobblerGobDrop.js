import mongoose from "mongoose";
import ETHGobblerGobDropSchema from "../schemas/ETHGobblerGobDropSchema.js";

const schema = new mongoose.Schema(ETHGobblerGobDropSchema);
const ETHGobblerGobDrop = mongoose.model("ETHGobblerGobDrop", schema);

export default ETHGobblerGobDrop;
