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

        const extracted = Playlist.generate(params, playlist);
        list = list.concat(extracted.list);
        params.cacheLimit -= extracted.seconds;

        const incToken =
            !extracted.validation.inList || !extracted.validation.inTimeLimit;
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
            Client.post(TRANSCODER_URL, {
                data: { params, list, counter },
            }).then(() => {
                setTimeout(() => {
                    if (reboot) {
                        Channel.bootstrap();
                    } else {
                        params.cacheLimit = CACHE_LIMIT;
                        Channel.assemble(params);
                    }
                }, 1000);
            });
        }
    }
}

export default Channel;
