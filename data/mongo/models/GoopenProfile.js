import mongoose from "mongoose";
import GoopenProfileSchema from "../schemas/GoopenProfileSchema.js";

const schema = new mongoose.Schema(GoopenProfileSchema);
const GoopenProfile = mongoose.model("GoopenProfile", schema);

export default GoopenProfile;
