import mongoose from "mongoose";
import WaifuWarriorSchema from "../schemas/MythWaifuWarrior.js";

const schema = new mongoose.Schema(WaifuWarriorSchema);
const WaifuWarrior = mongoose.model("WaifuWarrior", schema);

export default WaifuWarrior;
