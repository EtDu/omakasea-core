export default {
    address: { type: String },
    history: { type: Object, default: [] },
    pending: { type: Object, default: [] },
    folders: { type: Object, default: {} },
    createdAt: { type: Number },
};
