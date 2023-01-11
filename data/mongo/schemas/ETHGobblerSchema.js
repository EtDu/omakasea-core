export default {
    tokenID: { type: Number },
    parentTokenID: { type: Number, default: null },
    traitTokenIDs: { type: Object, default: [] },
    disposition: { type: String },
    health: { type: Number, default: 100 },
    mitosisCount: { type: Number, default: 0 },
    traitCount: { type: Number, default: 0 },
    sleptAt: { type: Number, default: null },
    generation: { type: Number, default: null },
    isAwake: { type: Boolean, default: true },
    isBuried: { type: Boolean, default: false },
    createdAt: { type: Number },
};
