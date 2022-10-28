export default {
    isActive: { type: Boolean, default: true },
    isUploaded: { type: Boolean, default: false },
    hasError: { type: Boolean, default: true },
    folderUUID: { type: String },
    uuid: { type: String },
    cid: { type: String },
    address: { type: String },
    filename: { type: String },
    extension: { type: String },
    metadata: { type: Object },
    createdAt: { type: Number },
};
