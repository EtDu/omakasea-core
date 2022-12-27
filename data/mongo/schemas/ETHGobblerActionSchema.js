export default {
    tokenID: { type: Number },
    owner: { type: String, default: null },
    fnName: { type: String, default: null },
    actionName: { type: String, default: null },
    amount: { type: Number, default: 0 },
    sig: { type: Object, default: null },
    ackState: { type: Number, default: 0 },
    createdAt: { type: Number },
};
