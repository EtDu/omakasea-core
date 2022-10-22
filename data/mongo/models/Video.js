import mongoose from "mongoose";
import VideoSchema from "../schemas/VideoSchema.js";

const target = new mongoose.Schema(VideoSchema);
const Video = mongoose.model("Video", target);

export default Video;
