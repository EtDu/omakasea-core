import mongoose from "mongoose";
import GoopenImageSchema from "../schemas/GoopenImageSchema.js";

const schema = new mongoose.Schema(GoopenImageSchema);
const GoopenImage = mongoose.model("GoopenImage", schema);

export default GoopenImage;
