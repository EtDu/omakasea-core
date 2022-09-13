const mongoose = require("mongoose");
const VideoUploadSchema = require("../schemas/VideoUploadSchema");

const target = new mongoose.Schema(VideoUploadSchema);
const VideoUpload = mongoose.model("VideoUpload", target);

module.exports = VideoUpload;
