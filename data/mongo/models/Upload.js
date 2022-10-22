import mongoose from "mongoose";
import UploadSchema from "../schemas/UploadSchema.js";

const target = new mongoose.Schema(UploadSchema);
const Upload = mongoose.model("Upload", target);

export default Upload;
