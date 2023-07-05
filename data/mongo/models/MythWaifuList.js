import mongoose from "mongoose";
import MythWaifuListSchema from "../schemas/MythWaifuListSchema.js";

const schema = new mongoose.Schema(MythWaifuListSchema);
const MythWaifuList = mongoose.model("MythWaifuList", schema);

export default MythWaifuList;
