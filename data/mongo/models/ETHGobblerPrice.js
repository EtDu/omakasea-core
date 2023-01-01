import mongoose from "mongoose";
import ETHGobblerPriceSchema from "../schemas/ETHGobblerPriceSchema.js";

const schema = new mongoose.Schema(ETHGobblerPriceSchema);
const ETHGobblerPrice = mongoose.model("ETHGobblerPrice", schema);

export default ETHGobblerPrice;
