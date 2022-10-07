import mongoose from "mongoose";
import ContributorSchema from "../schemas/ContributorSchema.js";

const contributorSchema = new mongoose.Schema(ContributorSchema);
const Contributor = mongoose.model("Contributor", contributorSchema);

export default Contributor;
