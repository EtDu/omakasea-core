export default {
    tokenID: { type: Number },
    disposition: { type: String },
    health: { type: Number, default: 100 },
    generation: { type: Number, default: null },
    isAwake: { type: Boolean, default: true },
    isBuried: { type: Boolean, default: false },
    createdAt: { type: Number },
};
