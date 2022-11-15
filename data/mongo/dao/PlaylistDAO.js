import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import Playlist from "../models/Playlist.js";
import MegalithToken from "../../../util/MegalithToken.js";

const SECONDS = 60 * 60 * 24 * 14;
const TOKEN_ID = 9999;
const MGLTH_TOKEN = {
    tokenId: TOKEN_ID,
    position: 9999,
    isVandal: true,
    seconds: SECONDS,
};

class PlaylistDAO {
    static save(playlist) {
        return __BaseDAO__.__save__(playlist);
    }

    static get(query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(Playlist, query).then((result) => {
                if (result !== null) {
                    resolve(result);
                } else {
                    if (query.tokenId !== 9999) {
                        MegalithToken.getToken(query.tokenId).then((token) => {
                            query.token = token;
                            resolve(
                                new Playlist({
                                    ...query,
                                    createdAt: Date.now(),
                                }),
                            );
                        });
                    } else {
                        query.token = MGLTH_TOKEN;
                        resolve(
                            new Playlist({ ...query, createdAt: Date.now() }),
                        );
                    }
                }
            });
        });
    }

    static search(query, orderBy = {}, limit = 0) {
        return __BaseDAO__.__search__(Playlist, query, {}, orderBy, limit);
    }

    static nextFrom(token) {
        const query = { tokenId: { $gte: token.tokenId } };
        const orderBy = { "token.position": 1, "token.tokenId": 1 };
        return PlaylistDAO.search(query, orderBy, 1);
    }
}

export default PlaylistDAO;
