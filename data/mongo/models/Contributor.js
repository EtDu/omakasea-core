const mongoose = require("mongoose");
const ContributorSchema = require("../schemas/ContributorSchema");

const contributorSchema = new mongoose.Schema(ContributorSchema);
const Contributor = mongoose.model("Contributor", contributorSchema);

module.exports = Contributor;
