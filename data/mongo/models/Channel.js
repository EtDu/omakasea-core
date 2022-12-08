import mongoose from "mongoose";
import ChannelSchema from "../schemas/ChannelSchema.js";

const schema = new mongoose.Schema(ChannelSchema);
const Channel = mongoose.model("Channel", schema);

export default Channel;
