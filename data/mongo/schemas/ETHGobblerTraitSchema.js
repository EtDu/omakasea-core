export default {
    name: { type: String, default: null },
    address: { type: String, default: null },
    amountETH: { type: String, default: null },
    gobblerID: { type: Number, default: null },
    traitID: { type: Number, default: null },
    type: { type: String },
    effect: { type: Object },
    equipSlot: { type: String, default: null },
    fileName: { type: String, default: null },
    metadata: { type: Object, default: {} },
    createdAt: { type: Number },
};
