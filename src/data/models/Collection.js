require("dotenv").config;

const mongoose = require("mongoose");
const CollectionSchema = require("../schemas/CollectionSchema");

const collectionSchema = new mongoose.Schema(CollectionSchema);
const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
