import mongoose from "mongoose";
import PepeAttackSchema from "../schemas/PepeAttackSchema.js";

const schema = new mongoose.Schema(PepeAttackSchema);
const PepeAttack = mongoose.model("PepeAttack", schema);

export default PepeAttack;
