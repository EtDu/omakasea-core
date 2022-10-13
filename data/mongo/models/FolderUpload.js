import mongoose from "mongoose";
import FolderUploadSchema from "../schemas/FolderUploadSchema.js";

const target = new mongoose.Schema(FolderUploadSchema);
const FolderUpload = mongoose.model("FolderUpload", target);

export default FolderUpload;
