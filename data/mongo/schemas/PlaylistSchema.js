export default {
    symbol: { type: String },
    tokenId: { type: Number },
    token: { type: Object, default: null },
    listing: { type: Array, default: [] },
    cid: { type: String, default: null },
    createdAt: { type: Number },
};
