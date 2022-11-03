export default {
    symbol: { type: String },
    tokenId: { type: Number },
    marker: { type: Object, default: null },
    listing: { type: Object, default: [] },
    cid: { type: String, default: null },
    createdAt: { type: Number },
};
