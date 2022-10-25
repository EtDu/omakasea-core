export default {
    address: { type: String },
    folderUUID: { type: String },
    cid: { type: String },
    files: { type: Object },
    isReady: { type: Boolean, default: false },
    isUploaded: { type: Boolean, default: false },
    isMerged: { type: Boolean, default: false },
    createdAt: { type: Number },
};
