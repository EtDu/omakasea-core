import mongoose from "mongoose";
import PlaylistSchema from "../schemas/PlaylistSchema.js";

const schema = new mongoose.Schema(PlaylistSchema);
const Playlist = mongoose.model("Playlist", schema);

export default Playlist;
