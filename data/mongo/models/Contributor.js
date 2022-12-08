import mongoose from "mongoose";
import ContributorSchema from "../schemas/ContributorSchema.js";

const schema = new mongoose.Schema(ContributorSchema);
const Contributor = mongoose.model("Contributor", schema);

export default Contributor;
