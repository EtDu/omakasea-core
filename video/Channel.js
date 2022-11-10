import Playlist from "./Playlist.js";
import Client from "../http/Client.js";
import PlaylistDAO from "../data/mongo/dao/PlaylistDAO.js";
import ChannelDAO from "../data/mongo/dao/ChannelDAO.js";
import { CACHE_LIMIT } from "../data/Constants.js";
import FileSystem from "../util/FileSystem.js";

const TRANSCODER_HOST = process.env.TRANSCODER_HOST;
const TRANSCODER_PORT = process.env.TRANSCODER_PORT;
const TRANSCODER_URL = `http://${TRANSCODER_HOST}:${TRANSCODER_PORT}`;

const STREAMER_HOST = process.env.STREAMER_HOST;
const STREAMER_PORT = process.env.STREAMER_PORT;
const STREAMER_URL = `http://${STREAMER_HOST}:${STREAMER_PORT}`;

let COUNTER = 1;

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

class Channel {
    static proceed(details) {
        console.log("/////////////////////////");
        console.log("TRANSCODER LOADED");
        console.log("/////////////////////////");
        ChannelDAO.get({ name: details.name, symbol: details.symbol }).then(
            (channel) => {
                channel.status.isLoaded = true;
                channel.status.cacheLimit = CACHE_LIMIT;
                if (channel.status.playing === null) {
                    channel.status.cTokenId = -1;
                    channel.cache = [];
                }

                Channel.assemble(channel, []);
            },
        );
    }
    static next(details) {
        ChannelDAO.get({ name: "MEGALITH", symbol: "KEYS" }).then((channel) => {
            channel.status.cacheLimit = CACHE_LIMIT;
            if (channel.status.playing === null) {
                channel.status.cTokenId = -1;
                channel.cache = [];
            }

            Channel.assemble(channel, []);
        });
    }

    static remaining(details) {
        ChannelDAO.get({ name: details.name, symbol: details.symbol }).then(
            (channel) => {
                if (channel.remaining.length > 0) {
                    const remaining = [...channel.remaining];
                    const playing = remaining.shift();

                    channel.remaining = remaining;
                    ChannelDAO.save(channel).then(() => {
                        const payload = {
                            filename: playing.name,
                            playing: FileSystem.getTranscodePath(playing),
                            name: channel.name,
                            symbol: channel.symbol,
                            isEnding: channel.status.isEnding,
                            isLoaded: channel.status.isLoaded,
                        };

                        Client.post(`${STREAMER_URL}/stream`, {
                            data: { payload },
                        });
                    });
                } else {
                    channel.status.isEnding = false;
                    ChannelDAO.save(channel).then(() => {
                        const payload = {
                            filename: channel.status.playing.name,
                            playing: FileSystem.getTranscodePath(
                                channel.status.playing,
                            ),
                            name: channel.name,
                            symbol: channel.symbol,
                            isEnding: channel.status.isEnding,
                            isLoaded: channel.status.isLoaded,
                        };

                        Client.post(`${STREAMER_URL}/stream`, {
                            data: { payload },
                        });
                    });
                }
            },
        );
    }

    static bootstrap() {
        ChannelDAO.get({ name: "MEGALITH", symbol: "KEYS" }).then((channel) => {
            channel.status.cacheLimit = CACHE_LIMIT;
            if (channel.status.playing === null) {
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
            const cache = channel.cache;

            channel.status.cTokenId = list[0].tokenId;
            channel.status.playing = list[0];
            channel.cache = list;
            ChannelDAO.save(channel).then(() => {
                const counter = COUNTER++;
                const payload = {
                    filename: channel.status.playing.name,
                    playing: FileSystem.getTranscodePath(
                        channel.status.playing,
                    ),
                    name: channel.name,
                    symbol: channel.symbol,
                    isEnding: channel.status.isEnding,
                    isLoaded: channel.status.isLoaded,
                };

                if (reboot) {
                    channel.status.playing = null;
                    channel.status.isEnding = true;
                    channel.status.isLoaded = false;

                    payload.isEnding = true;
                    payload.isLoaded = false;

                    channel.remaining = channel.cache;
                    channel.cache = [];
                }

                const transcode = {
                    name: channel.name,
                    symbol: channel.symbol,
                    status: { ...channel.status },
                    list,
                    counter,
                };

                ChannelDAO.save(channel).then(() => {
                    transcode.files = Channel.filter(channel, cache);

                    Client.post(TRANSCODER_URL, {
                        data: { ...transcode },
                    }).then(() => {
                        if (channel.status.isLoaded) {
                            Client.post(`${STREAMER_URL}/stream`, {
                                data: { payload },
                            });
                        }
                    });
                });
            });
        }
    }

    static filter(channel, cache) {
        const currCache = channel.cache;
        const pass1 = [];
        const pass2 = [];
        const index = {};

        if (cache.length > 0) {
            for (const video of cache) {
                index[video.uuid] = video;
            }

            for (let i = 0; i < currCache.length; i++) {
                const video = currCache[i];
                if (index[video.uuid] === undefined) {
                    video.index = i;
                    pass1.push(video);
                }
            }

            for (const video of pass1) {
                if (video.index > currCache.length / 2) {
                    pass2.push(video);
                }
            }
            return pass2;
        } else {
            return channel.cache;
        }
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

export default Channel;
