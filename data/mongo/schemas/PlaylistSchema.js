export default {
    cid: { type: String },
    address: { type: String },
    listing: { type: Object, default: [] },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Number },
};
