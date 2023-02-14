export default {
  imageID: { type: String },
  filename: { type: String },
  mimeType: { type: String },

  isProfileImage: { type: Boolean },

  address: { type: String },
  artistName: { type: String },
  mintCount: { type: Number },

  title: { type: String },
  description: { type: String },
  price: { type: String },

  activatedAt: { type: Number },
  deactivatedAt: { type: Number },

  likes: { type: Array, default: [] },
  dislikes: { type: Array, default: [] },

  isFeatured: { type: Boolean },
  isActive: { type: Boolean },

  createdAt: { type: Number },
};
