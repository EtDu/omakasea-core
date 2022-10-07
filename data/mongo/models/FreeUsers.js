import mongoose from "mongoose";
import FreeUserSchema from "../schemas/FreeUserSchema.js";

const freeUsersSchema = new mongoose.Schema(FreeUserSchema, {
    collection: process.env.FREE_USERS_DB,
});
const FreeUsers = mongoose.model("FreeUsers", freeUsersSchema);

export default FreeUsers;
