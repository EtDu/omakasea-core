import Playlist from "./Playlist.js";
import Client from "../http/Client.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";
import { CACHE_LIMIT } from "../data/Constants.js";

const TRANSCODER_HOST = process.env.TRANSCODER_HOST;
const TRANSCODER_PORT = process.env.TRANSCODER_PORT;
const TRANSCODER_URL = `http://${TRANSCODER_HOST}:${TRANSCODER_PORT}`;

let COUNTER = 1;

class Channel {
    static bootstrap() {
        const params = {
            cTokenId: 1,
        };
        params.cacheLimit = CACHE_LIMIT;
        Channel.assemble(params, []);
    }

    static assemble(params, list = []) {
        if (params.cacheLimit <= 0) {
            Channel.broadcast(params, list, false);
        } else {
            PlaylistDAO.nextFrom({ tokenId: params.cTokenId }).then(
                (result) => {
                    if (result.length === 1) {
                        Channel.build(params, list, result[0]);
                    } else {
                        Channel.broadcast(params, list, true);
                    }
                },
            );
        }
    }

    static build(params, list, playlist) {
        params.cTokenId = playlist.token.tokenId;

        const generated = Playlist.generate(params, playlist);
        list = list.concat(generated.list);
        params.cacheLimit -= generated.seconds;

        const incToken =
            !generated.validation.inList || !generated.validation.inTimeLimit;
        if (incToken) {
            params.cTokenId += 1;
        }

        Channel.assemble(params, list);
    }

    static broadcast(params, list, reboot) {
        if (list.length > 0) {
            params.cTokenId = list[0].tokenId;
            params.startFrom = list[0];

            const counter = COUNTER++;

            const data = { params, list, counter };
            Channel.filter(data);

            Client.post(TRANSCODER_URL, {
                data,
            }).then(() => {
                setTimeout(() => {
                    if (reboot) {
                        Channel.bootstrap();
                    } else {
                        params.cacheLimit = CACHE_LIMIT;
                        Channel.assemble(params);
                    }
                }, 3000);
            });
        }
    }

    static filter(data) {
        const { params, list, counter } = data;

        const duration = getDuration(list);
        console.log(
            `================ ${counter - 1}\t${Playlist.toTimeKey(
                Playlist.toSeconds(duration),
            )}\n`,
        );
        console.log(`${params.cTokenId}\t${list.length}\t${params.cTokenId}`);

        let i = 0;
        for (const video of list) {
            let filename = `${video.uuid}.${video.extension}`;

            let a = i <= list.length / 2 ? "-" : " ";
            let b = "";

            if (video.boundary) {
                filename = `${video.uuid}.${video.extension}`;
                b = video.boundary
                    ? `[${Playlist.toTimeKey(
                          Playlist.toSeconds(video.boundary),
                      )}]`
                    : "";
            }
            console.log(`\t\t${video.tokenId}\t ${a} ${filename}\t${b}`);
            i++;
        }
        console.log(`\n================ ${counter}`);
    }
}

function getDuration(frame) {
    let seconds = 0;
    for (const video of frame) {
        if (video.boundary) {
            seconds += Playlist.toSeconds(video.boundary);
        } else {
            seconds += Playlist.toSeconds(video.metadata.duration);
        }
    }
    const duration = Playlist.toDuration(seconds);
    duration.total = seconds;
    return duration;
}

export default Channel;
