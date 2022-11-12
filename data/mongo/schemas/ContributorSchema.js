export default {
    symbol: { type: String },
    address: { type: String },
    tokenId: { type: Number, default: -1 },
    token: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
};
