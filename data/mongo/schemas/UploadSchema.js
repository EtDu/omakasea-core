export default {
    symbol: { type: String },
    tokenId: { type: Number },
    folderUUID: { type: String },
    cid: { type: String },
    files: { type: Object },
    isReady: { type: Boolean, default: false },
    isValid: { type: Boolean, default: false },
    isUploaded: { type: Boolean, default: false },
    isMerged: { type: Boolean, default: false },
    listing: { type: Object, default: [] },
    createdAt: { type: Number },
};
