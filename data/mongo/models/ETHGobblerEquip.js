import mongoose from "mongoose";
import ETHGobblerEquipSchema from "../schemas/ETHGobblerEquipSchema.js";

const schema = new mongoose.Schema(ETHGobblerEquipSchema);
const EThGobblerEquip = mongoose.model("EThGobblerEquip", schema);

export default EThGobblerEquip;
