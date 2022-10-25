export default {
    address: { type: String },
    folderUUID: { type: String },
    cid: { type: String },
    files: { type: Object },
    count: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false },
    isUploaded: { type: Boolean, default: false },
    isProcessing: { type: Boolean, default: false },

    createdAt: { type: Number },
};
