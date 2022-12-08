import mongoose from "mongoose";
import UploadSchema from "../schemas/UploadSchema.js";

const schema = new mongoose.Schema(UploadSchema);
const Upload = mongoose.model("Upload", schema);

export default Upload;
