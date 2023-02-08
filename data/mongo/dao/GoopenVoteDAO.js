import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import GoopenVote from "../models/GoopenVote.js";

class GoopenVoteDAO {
    static async save(image) {
        return __BaseDAO__.__save__(image);
    }

    static async create(image) {
        return __BaseDAO__.__save__(new GoopenVote(image));
    }

    static get(query) {
        return __BaseDAO__.__get__(GoopenVote, query);
    }

    static search(query) {
        return __BaseDAO__.__search__(GoopenVote, query, {}, { createdAt: 1 });
    }
}

export default GoopenVoteDAO;
