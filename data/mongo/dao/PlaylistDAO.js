import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import Playlist from "../models/Playlist.js";
import MegalithToken from "../../../util/MegalithToken.js";

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
                    MegalithToken.getToken(query.tokenId).then((token) => {
                        query.token = token;
                        resolve(new Playlist({ ...query }));
                    });
                }
            });
        });
    }

    static search(query, orderBy = {}, limit = 0) {
        return __BaseDAO__.__search__(Playlist, query, {}, orderBy, limit);
    }

    static nextFrom(token) {
        const query = {
            tokenId: { $gte: token.tokenId },
        };
        const orderBy = {
            "token.tokenId": 1,
        };
        return PlaylistDAO.search(query, orderBy, 1);
    }
}

export default PlaylistDAO;
