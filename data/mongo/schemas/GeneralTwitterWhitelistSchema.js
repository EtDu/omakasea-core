export default {
  inviteID: { type: String },
  originator: { type: String, default: null },
  owner: { type: String, default: null },
  mintData: { type: Object, default: null },
  tokenID: { type: Number, default: null },
  hasMinted: { type: Boolean, default: false },
  twitterHandle: { type: String, default: null },
  createdAt: { type: Number },
};
