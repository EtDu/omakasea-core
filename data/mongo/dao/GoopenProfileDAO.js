import crypto from "crypto";
import __BaseDAO__ from "./__BaseDAO__.js";
import GoopenProfile from "../models/GoopenProfile.js";

class GoopenProfileDAO {
    static async save(profile) {
        return __BaseDAO__.__save__(profile);
    }

    static async create(address) {
        const profile = { address, createdAt: Date.now() };
        return __BaseDAO__.__save__(new GoopenProfile(profile));
    }

    static async update(data) {
        const { address } = data;
        const profile = await this.get({ address });
        for (const key of Object.keys(profile)) {
            if (data[key]) {
                profile[key] = data[key];
            }
        }
        return this.save(profile);
    }

    static get(query) {
        return __BaseDAO__.__get__(GoopenProfile, query);
    }

    static async fetch(address) {
        let profile = await this.get({ address });
        let exists;
        if (profile) {
            exists = true;
        } else {
            exists = false;
            profile = await this.create(address);
        }
        return { profile, exists };
    }

    static search(query) {
        return __BaseDAO__.__search__(
            GoopenProfile,
            query,
            {},
            { createdAt: 1 },
        );
    }
}

export default GoopenProfileDAO;
