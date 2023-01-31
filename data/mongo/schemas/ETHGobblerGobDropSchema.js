export default {
    isActive: { type: Boolean },
    name: { type: String },
    minETH: { type: String, default: null },
    maxGen: { type: Number, default: 1 },
    maxSupply: { type: Number, default: null },
    template: { type: String },
    createdAt: { type: Number },
};
