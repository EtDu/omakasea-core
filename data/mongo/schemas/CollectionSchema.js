module.exports = {
  date: { type: Date, default: Date.now },

  // session
  creatorAddress: String,
  isEditing: { type: Boolean, default: true },
  isUploaded: { type: Boolean, default: false },

  // generated-ID mappings
  resources: { type: Object, default: {} },
  generated: { type: Object, default: {} },

  // IPFS
  cid: { type: String },

  // front-end
  collectionName: String,
  symbol: String,
  allowListMintPrice: String,
  maxAllowedMints: { type: Number, default: 0 },
  price: String,
  description: String,
  contractType: String,
  maxSupply: { type: Number, default: 0 },
  revealOnMint: { type: Boolean, default: false },

  // URLs
  metaDataBaseUrl: String,
  imgBaseUrl: String,
  tempImageUrl: String,
  tempDataUrl: String,
  previewImageUrl: String,

  // mintPage
  mintPageImgBaseUrl: String,
  mintPageDesktopImageUrl: String,
  mintPageMobileImageUrl: String,

  // social media
  status: String,
  discord: String,
  twitter: String,
  instagram: String,
  opensea: String,
  telegram: String,

  // permissions
  removeBrandingMintPage: Boolean,

  // addresses
  currencyAddress: String,
  contractAddress: String,

  // smart contract
  provenanceHash: String,
  deployTxHash: String,
  paidTxHash: String,
  network: String,

  allowListWallets: [String],
};
