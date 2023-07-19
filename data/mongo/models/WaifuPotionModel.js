import mongoose from "mongoose";
import WaifuPotionSchema from "../schemas/MythWaifuPotions.js";

const schema = new mongoose.Schema(WaifuPotionSchema);
const WaifuPotion = mongoose.model("WaifuPotion", schema);

export default WaifuPotion;
