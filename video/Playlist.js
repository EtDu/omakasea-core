import dotenv from "dotenv";
dotenv.config();

import IPFS from "../data/net/IPFS.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";

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

    static isVideoClipped(video) {
        if (video.boundary) {
            const hEqual =
                video.metadata.duration.hours === video.boundary.hours;
            const mEqual =
                video.metadata.duration.minutes === video.boundary.minutes;
            const sEqual =
                video.metadata.duration.seconds === video.boundary.seconds;
            return !(hEqual && mEqual && sEqual);
        } else {
            return false;
        }
    }

    static generate(status, playlist) {
        const playing = status.playing;
        let i = 0;
        let cacheLimit = 0;
        let timeLimit = playlist.token.seconds;

        if (playing) {
            i = Playlist.indexOf(playlist, playing);

            let k = 0;
            while (k < i) {
                const seconds = Playlist.toSeconds(
                    playlist.listing[k].metadata.duration,
                );
                timeLimit -= seconds;
                k++;
            }

            i++;
            status.playing = null;
        }

        let inList = i < playlist.listing.length;
        let inCacheLimit = cacheLimit < status.cacheLimit;
        let inTimeLimit = timeLimit > 0;

        const list = [];

        while (inList && inCacheLimit && inTimeLimit) {
            const current = playlist.listing[i];
            const seconds = Playlist.toSeconds(current.metadata.duration);

            cacheLimit += seconds;
            timeLimit -= seconds;
            list.push({ ...current, tokenId: playlist.token.tokenId });

            i++;

            inList = i < playlist.listing.length;
            inCacheLimit = cacheLimit < status.cacheLimit;
            inTimeLimit = timeLimit > 0;
        }

        if (!inTimeLimit && list.length > 0) {
            const last = list[list.length - 1];
            const lastSeconds = Playlist.toSeconds(last.metadata.duration);
            last.boundary = Playlist.toDuration(timeLimit + lastSeconds);
        }

        let seconds = 0;
        for (const video of list) {
            if (video.boundary) {
                seconds += Playlist.toSeconds(video.boundary);
            } else {
                seconds += Playlist.toSeconds(video.metadata.duration);
            }
        }

        const validation = { inList, inCacheLimit, inTimeLimit };
        return { list, seconds, validation };
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
