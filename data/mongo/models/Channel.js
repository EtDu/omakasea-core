import mongoose from "mongoose";
import ChannelSchema from "../schemas/ChannelSchema.js";

const target = new mongoose.Schema(ChannelSchema);
const Channel = mongoose.model("Channel", target);

export default Channel;
