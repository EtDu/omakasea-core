export default {
    name: { type: String },
    symbol: { type: String },
    status: { type: Object, default: {} },
    cache: { type: Array, default: [] },
    createdAt: { type: Number },
};
