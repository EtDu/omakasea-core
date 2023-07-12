import mongoose from "mongoose";
import MythConsume from "../schemas/MythConsume.js";

const schema = new mongoose.Schema(MythConsume);
const consume = mongoose.model("MythConsume", schema);

export default consume;
