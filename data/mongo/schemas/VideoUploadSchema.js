module.exports = {
    isUploaded: { type: Boolean, default: false },
    isProcessed: { type: Boolean, default: false },
    uuid: { type: String },
    address: { type: String },
    filename: { type: String },
    extension: { type: String },
    createdAt: { type: Number },
};
