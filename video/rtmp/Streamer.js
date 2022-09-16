require("dotenv").config();
const NodeMediaServer = require("node-media-server");

const BASE_CONFIG = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
    },
    http: {
        mediaroot: process.env.MEDIA_ROOT,
        allow_origin: "*",
        port: 9001,
    },
    trans: {
        ffmpeg: process.env.FFMPEG,
        tasks: [
            {
                app: "live",
                hls: true,
                hlsFlags:
                    "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
                hlsKeep: true,
                dash: true,
                dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
            },
        ],
    },
};

class Streamer {
    constructor(ports, config) {
        this.config = { ...BASE_CONFIG, ...config };
        this.config.rtmp.port = ports.rtmp;
        this.config.http.port = ports.http;
        this.streamer = new NodeMediaServer(this.config);
    }

    run() {
        this.streamer.run();
    }
}

module.exports = Streamer;
