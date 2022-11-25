export default {
    tokenId: { type: Number },
    isUploaded: { type: Boolean, default: false },
    isValid: { type: Boolean, default: false },
    isIPFS: { type: Boolean, default: false },
    folderUUID: { type: String },
    uuid: { type: String },
    cid: { type: String },
    filename: { type: String },
    extension: { type: String },
    metadata: { type: Object },
    createdAt: { type: Number },
};
