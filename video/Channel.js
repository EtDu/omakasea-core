import Playlist from "./Playlist.js";
import Client from "../http/Client.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";
import ChannelDAO from "../data/mongo/dao/ChannelDAO.js";
import { CACHE_LIMIT } from "../data/Constants.js";

const TRANSCODER_HOST = process.env.TRANSCODER_HOST;
const TRANSCODER_PORT = process.env.TRANSCODER_PORT;
const TRANSCODER_URL = `http://${TRANSCODER_HOST}:${TRANSCODER_PORT}`;

const BROADCAST_DELAY = 500;

let COUNTER = 1;

class Channel {
    static bootstrap() {
        ChannelDAO.get({ name: "MEGALITH", symbol: "KEYS" }).then((channel) => {
            channel.status.cacheLimit = CACHE_LIMIT;
            if (channel.status.startFrom === null) {
                channel.status.cTokenId = -1;
                channel.cache = [];
            }
            Channel.assemble(channel, []);
        });
    }

    static assemble(channel, list = []) {
        if (channel.status.cacheLimit <= 0) {
            Channel.broadcast(channel, list, false);
        } else {
            const tokenId = channel.status.cTokenId;
            PlaylistDAO.nextFrom({ tokenId }).then((result) => {
                if (result.length === 1) {
                    Channel.build(channel, list, result[0]);
                } else {
                    Channel.broadcast(channel, list, true);
                }
            });
        }
    }

    static build(channel, list, playlist) {
        channel.status.cTokenId = playlist.token.tokenId;

        const generated = Playlist.generate(channel.status, playlist);
        list = list.concat(generated.list);
        channel.status.cacheLimit -= generated.seconds;

        const incToken =
            !generated.validation.inList || !generated.validation.inTimeLimit;
        if (incToken) {
            channel.status.cTokenId += 1;
        }

        ChannelDAO.save(channel).then(() => {
            Channel.assemble(channel, list);
        });
    }

    static broadcast(channel, list, reboot) {
        if (list.length > 0) {
            channel.status.cTokenId = list[0].tokenId;
            channel.status.startFrom = list[0];
            channel.cache = list;
            ChannelDAO.save(channel).then(() => {
                const counter = COUNTER++;
                const data = { status: channel.status, list, counter };
                Channel.display(data);

                Client.post(TRANSCODER_URL, {
                    data,
                }).then(() => {
                    setTimeout(() => {
                        if (reboot) {
                            // THIS WILL REBOOT IT
                            channel.status.startFrom = null;
                            ChannelDAO.save(channel).then(() => {
                                Channel.bootstrap();
                            });
                        } else {
                            channel.status.cacheLimit = CACHE_LIMIT;
                            Channel.assemble(channel);
                        }
                    }, BROADCAST_DELAY);
                });
            });
        }
    }

    static filter(data) {
        const { status, list, counter } = data;
        const filtered = [];

        for (let i = 0; i < list.length; i++) {
            const video = list[i];
        }

        return filtered;
    }

    static display(data) {
        const { status, list, counter } = data;

        const duration = getDuration(list);
        console.log(
            `================ ${counter - 1}\t${Playlist.toTimeKey(
                Playlist.toSeconds(duration),
            )}\n`,
        );
        console.log(`${status.cTokenId}\t${list.length}\t${status.cTokenId}`);

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
