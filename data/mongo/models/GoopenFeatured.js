import mongoose from "mongoose";
import GoopenFeaturedSchema from "../schemas/GoopenFeaturedSchema.js";

const schema = new mongoose.Schema(GoopenFeaturedSchema);
const GoopenFeatured = mongoose.model("GoopenFeatured", schema);

export default GoopenFeatured;
