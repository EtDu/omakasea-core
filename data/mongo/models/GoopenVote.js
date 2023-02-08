import mongoose from "mongoose";
import GoopenVoteSchema from "../schemas/GoopenVoteSchema.js";

const schema = new mongoose.Schema(GoopenVoteSchema);
const GoopenVote = mongoose.model("GoopenVote", schema);

export default GoopenVote;
