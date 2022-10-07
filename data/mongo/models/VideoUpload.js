import mongoose from "mongoose";
import VideoUploadSchema from "../schemas/VideoUploadSchema.js";

const target = new mongoose.Schema(VideoUploadSchema);
const VideoUpload = mongoose.model("VideoUpload", target);

export default VideoUpload;
