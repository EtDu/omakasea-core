module.exports = {
  uploadId: String,
  sequence: { type: Number },
  uid: { type: String },
  rating: { type: Number },
  traits: { type: Array },
  isValid: { type: Boolean, default: true },
};
