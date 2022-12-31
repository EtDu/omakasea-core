import mongoose from "mongoose";
import ETHGobblerMitosisSchema from "../schemas/ETHGobblerMitosisSchema.js";

const schema = new mongoose.Schema(ETHGobblerMitosisSchema);
const ETHGobblerMitosis = mongoose.model("ETHGobblerMitosis", schema);

export default ETHGobblerMitosis;
