import mongoose from "mongoose";
import WaifuWeaponSchema from "../schemas/MythWeaponMetadataSchema.js";

const schema = new mongoose.Schema(WaifuWeaponSchema);
const WaifuWeapon = mongoose.model("WaifuWeapons", schema);

export default WaifuWeapon;