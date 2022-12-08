import mongoose from "mongoose";
import VideoSchema from "../schemas/VideoSchema.js";

const schema = new mongoose.Schema(VideoSchema);
const Video = mongoose.model("Video", schema);

export default Video;
