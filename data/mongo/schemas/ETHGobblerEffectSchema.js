export default {
    type: { type: "string" },
    tokenID: { type: Number },
    gobDropTokenID: { type: Number },
    description: { type: String },
    durationSeconds: { type: Number },
    amount: { type: Number },
    traitBound: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Number },
};
