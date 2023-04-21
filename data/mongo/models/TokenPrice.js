import mongoose from "mongoose";
import TokenPriceSchema from "../schemas/TokenPriceSchema.js";

const schema = new mongoose.Schema(TokenPriceSchema);
const TokenPrice = mongoose.model("TokenPrice", schema);

export default TokenPrice;
