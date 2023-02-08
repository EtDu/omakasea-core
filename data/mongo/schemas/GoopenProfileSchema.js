export default {
    address: { type: String },
    contract: { type: String },
    isComplete: { type: Boolean },
    picID: { type: String },
    bio: { type: String },
    social: { type: Object, default: {} },
    createdAt: { type: Number },
};
