import mongoose from "mongoose";
import CollectionSchema from "../schemas/CollectionSchema.js";

const collectionSchema = new mongoose.Schema(CollectionSchema);
const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
