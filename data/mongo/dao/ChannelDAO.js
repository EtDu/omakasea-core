import __BaseDAO__ from "./__BaseDAO__.js";
import Channel from "../models/Channel.js";

class ChannelDAO {
    static save(channel) {
        channel.markModified("status");
        channel.markModified("cache");
        channel.markModified("remaining");
        return __BaseDAO__.__save__(channel);
    }

    static get(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(Channel, query).then((result) => {
                if (result !== null) {
                    resolve(result);
                } else {
                    const spec = {
                        ...query,
                        status: {
                            cTokenId: -1,
                            isLoaded: false,
                            isEnding: false,
                        },
                        createdAt: Date.now(),
                    };
                    const channel = new Channel(spec);
                    resolve(channel);
                }
            });
        });
    }
}

export default ChannelDAO;
