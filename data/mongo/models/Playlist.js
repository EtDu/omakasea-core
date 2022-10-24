import mongoose from "mongoose";
import PlaylistSchema from "../schemas/PlaylistSchema.js";

const target = new mongoose.Schema(PlaylistSchema);
const Playlist = mongoose.model("Playlist", target);

export default Playlist;
