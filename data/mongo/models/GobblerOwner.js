import mongoose from "mongoose";
import GobblerOwnerSchema from "../schemas/GobblerOwnerSchema.js";

const schema = new mongoose.Schema(GobblerOwnerSchema);
const GobblerOwners = mongoose.model("GobblerOwners", schema);

export default GobblerOwners;
