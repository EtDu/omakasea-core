import mongoose from "mongoose";
import ETHGobblerActionSchema from "../schemas/ETHGobblerActionSchema.js";

const schema = new mongoose.Schema(ETHGobblerActionSchema);
const ETHGobblerAction = mongoose.model("ETHGobblerAction", schema);

export default ETHGobblerAction;
