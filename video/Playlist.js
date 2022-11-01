import dotenv from "dotenv";
dotenv.config();

import IPFS from "../data/net/IPFS.js";
import UploadDAO from "../data/mongo/dao/UploadDAO.js";
import VideoDAO from "../data/mongo/dao/VideoDAO.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";
import FileSystem from "../util/FileSystem.js";
import Client from "../http/Client.js";
import Server from "../http/Server.js";
import FFMPEG from "../video/FFMPEG.js";

const STREAMER_HOST = process.env.STREAMER_HOST;
const STREAMER_PORT = process.env.STREAMER_PORT;
const STREAMER_URL = `http://${STREAMER_HOST}:${STREAMER_PORT}`;

const TRANSCODER_HOST = process.env.TRANSCODER_HOST;
const TRANSCODER_PORT = process.env.TRANSCODER_PORT;
const TRANSCODER_URL = `http://${TRANSCODER_HOST}:${TRANSCODER_PORT}`;

const IPFS_HOST = process.env.IPFS_HOST;
const IPFS_PORT = process.env.IPFS_PORT;
const IPFS_URL = `http://${IPFS_HOST}:${IPFS_PORT}/ipfs`;

const HOURS = 3;
const TIME_BUFFER = HOURS * 3600;
const ERROR_BUFFER_MAX = 3;

const THIS_PORT = 4081;
const THIS_NAME = "PLAYER";

const SORT_BY = (a, b) => {
    return b.uploadedAt - a.uploadedAt;
};

const LEADING_ZERO = (number) => {
    return number < 10 ? "0" + number : number;
};

class Playlist {
    static indexOf(playlist, resume = null) {
        let i = 0;

        if (resume !== null) {
            let isFound = false;

            for (const video of playlist.listing) {
                if (video.uuid === resume.uuid) {
                    isFound = true;
                }

                if (!isFound) {
                    i++;
                }
            }
        }

        return i;
    }

    static async merge(upload) {
        return new Promise((resolve, reject) => {
            PlaylistDAO.get({ address: upload.address }).then(
                async (playlist) => {
                    const merged = upload.listing
                        .concat(playlist.listing)
                        .sort(SORT_BY);
                    const listing = [];
                    for (const video of merged) {
                        listing.push({
                            name: video.name,
                            cid: video.cid,
                            uploadedAt: video.createdAt,
                        });
                    }

                    const playlistCID = await IPFS.savePlaylist(listing);

                    if (playlistCID !== null) {
                        playlist.cid = playlistCID;
                        playlist.listing = merged;
                        playlist.markModified("listing");
                        PlaylistDAO.save(playlist).then(resolve);
                    } else {
                        console.log("NULL CID FOUND");
                        resolve();
                    }
                },
            );
        });
    }

    static cycle(params) {
        return new Promise((resolve, reject) => {
            const address = params.address;
            PlaylistDAO.get({ address })
                .then((playlist) => {
                    const list = [];

                    let i = Playlist.indexOf(playlist);
                    let time = params.seconds;

                    if (playlist.resumeAt) {
                        const startSecs =
                            Playlist.toSeconds(
                                playlist.resumeAt.metadata.duration,
                            ) - Playlist.toSeconds(playlist.resumeAt.boundary);

                        if (startSecs > 30) {
                            time -= startSecs;
                            list.push(playlist.resumeAt);
                        }

                        i = Playlist.indexOf(playlist, playlist.resumeAt);
                        if (i + 1 < playlist.listing.length) {
                            i += 1;
                        } else {
                            i = 0;
                        }
                    }

                    while (time > 0) {
                        const current = playlist.listing[i];
                        time -= Playlist.toSeconds(current.metadata.duration);

                        const frame = { ...current };

                        list.push(frame);

                        if (i + 1 < playlist.listing.length) {
                            i += 1;
                        } else {
                            i = 0;
                        }
                    }

                    const last = list.pop();

                    last.boundary = Playlist.toDuration(
                        Playlist.toSeconds(last.metadata.duration) + time,
                    );

                    list.push(last);
                    playlist.resumeAt = last;
                    PlaylistDAO.save(playlist).then(() => {
                        resolve(list);
                    });
                })
                .catch(reject);
        });
    }

    static increment(address) {
        return new Promise((resolve, reject) => {
            PlaylistDAO.get({ address }).then((playlist) => {
                resolve();
            });
        });
    }

    static toSeconds(duration) {
        return (
            Number(duration.hours) * 3600 +
            Number(duration.minutes) * 60 +
            Number(duration.seconds)
        );
    }

    static toDuration(iSeconds) {
        var hours = Math.floor(iSeconds / 3600);
        var minutes = Math.floor((iSeconds - hours * 3600) / 60);
        var seconds = iSeconds - hours * 3600 - minutes * 60;
        return { hours, minutes, seconds };
    }

    static toTimeKey(iSeconds) {
        var hours = LEADING_ZERO(Math.floor(iSeconds / 3600));
        var minutes = LEADING_ZERO(Math.floor((iSeconds - hours * 3600) / 60));
        var seconds = LEADING_ZERO(iSeconds - hours * 3600 - minutes * 60);
        return `${hours}:${minutes}:${seconds}`;
    }
}

export default Playlist;
