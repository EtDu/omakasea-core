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

const IPFS_HOST = process.env.IPFS_HOST;
const IPFS_PORT = process.env.IPFS_PORT;
const IPFS_URL = `http://${IPFS_HOST}:${IPFS_PORT}/ipfs`;

const HOURS = 3;
const TIME_BUFFER = HOURS * 3600;
const ERROR_BUFFER_MAX = 3;

const THIS_PORT = 4081;
const THIS_NAME = "PLAYER";

class Playlist {
    constructor(address) {
        this.address = address;
        this.isLoaded = false;

        this.server = new Server(THIS_NAME, THIS_PORT);
        this.server.post("/", (req, res) => {
            res.json({ status: 200 });
            this.BROADCAST().then(() => {
                const last = {
                    cid: req.body.cid,
                    createdAt: req.body.uploadedAt,
                };

                VideoDAO.get(last).then((video) => {
                    try {
                        const remove =
                            this.cache[video.uuid] === 0 ||
                            this.cache[video.uuid] === undefined;

                        if (remove) {
                            const tPath = FileSystem.getTranscodePath(video);
                            if (FileSystem.exists(tPath)) {
                                console.log(`D - ${video.uuid}`);
                                FileSystem.delete(tPath);
                            }
                        } else {
                            this.cache[video.uuid] -= 1;
                        }
                    } catch (error) {
                        console.log(`PLAYBACK ERROR: ${error}`);
                    }
                });
            });
        });

        this.server.start();
    }

    toSeconds(metadata) {
        return (
            metadata.duration.hours * 3600 +
            metadata.duration.minutes * 60 +
            metadata.duration.seconds
        );
    }

    listing() {
        return new Promise((resolve, reject) => {
            UploadDAO.search({
                address: this.address,
                isUploaded: true,
                isMerged: false,
            }).then((uploads) => {
                if (uploads.length > 0) {
                    this.__listing__([...uploads], [], (cids) => {
                        PlaylistDAO.get({ address: this.address }).then(
                            async (playlist) => {
                                playlist.listing = cids
                                    .sort((a, b) => {
                                        return b.uploadedAt - a.uploadedAt;
                                    })
                                    .concat(playlist.listing);

                                const playlistCID = await IPFS.savePlaylist(
                                    playlist.listing,
                                );

                                if (playlistCID !== null) {
                                    playlist.cid = playlistCID;

                                    playlist.markModified("listing");
                                    PlaylistDAO.save(playlist).then(() => {
                                        for (const upload of uploads) {
                                            upload.isMerged = true;
                                            UploadDAO.save(upload);
                                        }
                                        resolve();
                                    });
                                } else {
                                    console.log("NULL CID FOUND");
                                    resolve();
                                }
                            },
                        );
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    __listing__(uploads, cids, callback) {
        if (uploads.length > 0) {
            const cid = uploads.shift().cid;
            const url = `${IPFS_URL}/${cid}`;

            Client.get(url).then((res) => {
                this.__listing__(uploads, cids.concat(res.data), callback);
            });
        } else {
            callback(cids);
        }
    }

    __next__(playlist) {
        let i = 0;
        let isFound = false;
        for (const video of playlist.listing) {
            if (this.__isPlaying__(video, playlist.playing)) {
                isFound = true;
            }

            if (!isFound) {
                i++;
            }
        }

        if (i + 1 < playlist.listing.length) {
            playlist.playing = playlist.listing[i + 1];
        } else {
            playlist.playing = playlist.listing[0];
        }

        return i;
    }

    load() {
        return new Promise((resolve, reject) => {
            PlaylistDAO.get({ address: this.address }).then((playlist) => {
                if (playlist.listing.length > 0) {
                    this.cache = {};
                    let index = 0;
                    if (playlist.playing !== null) {
                        index = this.__next__(playlist);
                    }

                    this.__load__(resolve, playlist, index);
                } else {
                    resolve([]);
                }
            });
        });
    }

    __load__(resolve, playlist, index = 0, runningTime = 0, listing = []) {
        if (index === playlist.listing.length) {
            index = 0;
        }

        if (runningTime < TIME_BUFFER) {
            const current = playlist.listing[index];
            const query = {
                cid: current.cid,
                createdAt: current.uploadedAt,
            };
            VideoDAO.get(query).then((video) => {
                runningTime += this.toSeconds(video.metadata);

                if (this.cache[video.uuid] === undefined) {
                    this.cache[video.uuid] = 0;
                }
                this.cache[video.uuid] += 1;
                listing.push(video);
                this.__load__(
                    resolve,
                    playlist,
                    index + 1,
                    runningTime,
                    listing,
                );
            });
        } else {
            resolve(listing);
        }
    }

    download(listing) {
        return new Promise((resolve, reject) => {
            const FILES = {
                downloads: [],
                transcoded: [],
            };
            this.__download__(resolve, listing, FILES);
        });
    }

    __download__(resolve, listing, files) {
        if (listing.length > 0) {
            const video = listing.shift();

            const dPath = FileSystem.getDownloadPath(video);
            const tPath = FileSystem.getTranscodePath(video);

            let op = "C";

            if (!this.isLoaded && listing.length < ERROR_BUFFER_MAX) {
                FileSystem.delete(dPath);
                FileSystem.delete(tPath);
                op = "R";
            }

            const isDownloaded = FileSystem.exists(dPath);
            const isTranscoded = FileSystem.exists(tPath);

            if (!isDownloaded && !isTranscoded) {
                IPFS.download(video).then(() => {
                    files.downloads.push(dPath);
                    console.log(`${op} | ${video.uuid}`);
                    FFMPEG.convert(video).then(() => {
                        files.transcoded.push(tPath);
                        FileSystem.delete(dPath);
                        this.__download__(resolve, listing, files);
                    });
                });
            } else if (!isTranscoded) {
                FFMPEG.convert(video).then(() => {
                    if (isDownloaded) {
                        FileSystem.delete(dPath);
                    }

                    files.transcoded.push(tPath);
                    this.__download__(resolve, listing, files);
                });
            } else {
                if (isDownloaded) {
                    FileSystem.delete(dPath);
                }

                files.transcoded.push(tPath);
                FileSystem.delete(dPath);
                this.__download__(resolve, listing, files);
            }
        } else {
            resolve(files);
        }
    }

    clear(files) {
        return new Promise((resolve, reject) => {
            this.__delete__(resolve, files);
        });
    }

    __delete__(resolve, files) {
        if (files.length > 0) {
            const current = files.shift();
            if (FileSystem.exists(current)) {
                FileSystem.delete(current);
            }

            this.__delete__(resolve, files);
        } else {
            resolve();
        }
    }

    __isPlaying__(video, playing) {
        return (
            video.cid === playing.cid && video.uploadedAt === playing.uploadedAt
        );
    }

    increment() {
        return new Promise((resolve, reject) => {
            PlaylistDAO.get({ address: this.address }).then((playlist) => {
                if (playlist.playing === null) {
                    playlist.playing = playlist.listing[0];
                } else {
                    this.__next__(playlist);
                }

                PlaylistDAO.save(playlist).then(() => {
                    resolve(playlist);
                });
            });
        });
    }

    BROADCAST() {
        return new Promise((resolve, reject) => {
            this.increment().then((playlist) => {
                const payload = { data: playlist.playing };
                Client.post(STREAMER_URL, payload).catch(() => {
                    console.log("STREAMER IS DOWN");
                });
                this.listing().then(() => {
                    this.load().then((listing) => {
                        this.download(listing).then((files) => {
                            resolve(files);
                        });
                    });
                });
            });
        });
    }

    START() {
        this.listing().then(() => {
            this.load().then((listing) => {
                if (listing.length > 0) {
                    this.download(listing).then(() => {
                        this.isLoaded = true;
                        PlaylistDAO.get({ address: this.address }).then(
                            (playlist) => {
                                const payload = { data: playlist.playing };
                                Client.post(STREAMER_URL, payload);
                            },
                        );
                    });
                } else {
                    console.log("WAITING 1 MINUTE");
                    setTimeout(() => {
                        this.START();
                    }, 60000);
                }
            });
        });
    }
}

export default Playlist;
