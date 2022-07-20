const mongoose = require("mongoose");
const FreeUserSchema = require("../schemas/FreeUserSchema");

const freeUsersSchema = new mongoose.Schema(FreeUserSchema, {
    collection: process.env.FREE_USERS_DB,
});
const FreeUsers = mongoose.model("FreeUsers", freeUsersSchema);

module.exports = FreeUsers;
