import mongoose from "mongoose";
import CollectionSchema from "../schemas/CollectionSchema.js";

const schema = new mongoose.Schema(CollectionSchema);
const Collection = mongoose.model("Collection", schema);

export default Collection;
