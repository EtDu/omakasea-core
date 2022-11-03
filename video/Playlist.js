import dotenv from "dotenv";
dotenv.config();

import IPFS from "../data/net/IPFS.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";

const STREAMER_HOST = process.env.STREAMER_HOST;
const STREAMER_PORT = process.env.STREAMER_PORT;
const STREAMER_URL = `http://${STREAMER_HOST}:${STREAMER_PORT}`;

const TRANSCODER_HOST = process.env.TRANSCODER_HOST;
const TRANSCODER_PORT = process.env.TRANSCODER_PORT;
const TRANSCODER_URL = `http://${TRANSCODER_HOST}:${TRANSCODER_PORT}`;

const IPFS_HOST = process.env.IPFS_HOST;
const IPFS_PORT = process.env.IPFS_PORT;
const IPFS_URL = `http://${IPFS_HOST}:${IPFS_PORT}/ipfs`;

const SORT_BY = (a, b) => {
    return b.uploadedAt - a.uploadedAt;
};

const LEADING_ZERO = (number) => {
    return number < 10 ? "0" + number : number;
};

const INCREMENT = (i, playlist) => {
    if (i + 1 < playlist.listing.length) {
        i += 1;
    } else {
        i = 0;
    }
    return i;
};

const IS_CLIPPED = (playlist) => {
    const hEqual =
        playlist.marker.metadata.duration.hours ===
        playlist.marker.boundary.hours;
    const mEqual =
        playlist.marker.metadata.duration.minutes ===
        playlist.marker.boundary.minutes;
    const sEqual =
        playlist.marker.metadata.duration.seconds ===
        playlist.marker.boundary.seconds;

    return hEqual && mEqual && sEqual;
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
            PlaylistDAO.get({
                tokenId: upload.tokenId,
                symbol: upload.symbol,
            }).then(async (playlist) => {
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
            });
        });
    }

    static playExactInterval(params) {
        return new Promise((resolve, reject) => {
            const tokenId = params.tokenId;
            PlaylistDAO.get({ tokenId })
                .then((playlist) => {
                    const list = [];

                    let i = Playlist.indexOf(playlist);
                    let time = params.seconds;

                    if (playlist.marker) {
                        if (!IS_CLIPPED(playlist)) {
                            const clipTime =
                                Playlist.toSeconds(
                                    playlist.marker.metadata.duration,
                                ) -
                                Playlist.toSeconds(playlist.marker.boundary);

                            time -= clipTime;
                            list.push(playlist.marker);
                        }

                        i = Playlist.indexOf(playlist, playlist.marker);
                        i = INCREMENT(i, playlist);
                    }

                    while (time > 0) {
                        const current = playlist.listing[i];
                        time -= Playlist.toSeconds(current.metadata.duration);
                        list.push(current);
                        i = INCREMENT(i, playlist);
                    }

                    const last = list.pop();
                    const lastSeconds = Playlist.toSeconds(
                        last.metadata.duration,
                    );

                    const clipTime = lastSeconds + time;
                    last.boundary = Playlist.toDuration(clipTime);
                    list.push(last);

                    playlist.marker = last;
                    PlaylistDAO.save(playlist).then(() => {
                        resolve(list);
                    });
                })
                .catch(reject);
        });
    }

    static clipFromStart(params) {
        return new Promise((resolve, reject) => {
            const tokenId = params.tokenId;
            PlaylistDAO.get({ tokenId })
                .then((playlist) => {
                    const list = [];

                    let i = 0;
                    let time = params.seconds;

                    while (time > 0 && i < playlist.listing.length) {
                        const current = playlist.listing[i];
                        time -= Playlist.toSeconds(current.metadata.duration);
                        list.push(current);
                        i += 1;
                    }

                    resolve(list);
                })
                .catch(reject);
        });
    }

    static infinitePlay(params) {
        return new Promise((resolve, reject) => {
            const tokenId = params.tokenId;
            PlaylistDAO.get({ tokenId })
                .then((playlist) => {
                    const list = [];

                    let i;
                    if (playlist.marker) {
                        i = Playlist.indexOf(playlist, playlist.marker);
                    }

                    let time = params.seconds;
                    while (time > 0) {
                        i = INCREMENT(i, playlist);

                        const current = playlist.listing[i];
                        time -= Playlist.toSeconds(current.metadata.duration);

                        const frame = { ...current };

                        list.push(frame);
                    }

                    const lastVideo = list.pop();
                    lastVideo.boundary = lastVideo.metadata.duration;
                    list.push(lastVideo);

                    playlist.marker = lastVideo;
                    playlist.markModified("marker");
                    PlaylistDAO.save(playlist).then(() => {
                        resolve(list);
                    });
                })
                .catch(reject);
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
