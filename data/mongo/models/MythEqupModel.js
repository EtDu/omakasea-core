import mongoose from "mongoose";
import MythEquipSchema from "../schemas/MythEquipSchema.js";

const schema = new mongoose.Schema(MythEquipSchema);
const MythEquipModel = mongoose.model("MythEquipModel", schema);

export default MythEquipModel;
