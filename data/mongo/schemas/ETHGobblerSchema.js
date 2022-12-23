export default {
    tokenID: { type: Number },
    parentTokenID: { type: Number, default: null },
    traitTokenIDs: { type: Object, default: [] },
    disposition: { type: String },
    health: { type: Number, default: 100 },
    mitosis: { type: Number, default: 10 },
    generation: { type: Number, default: null },
    isAwake: { type: Boolean, default: true },
    isBuried: { type: Boolean, default: false },
    createdAt: { type: Number },
};
