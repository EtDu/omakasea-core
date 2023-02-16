import __BaseDAO__ from "./__BaseDAO__.js";
import GoopenFeatured from "../models/GoopenFeatured.js";

class GoopenFeaturedDAO {
    static async save(item) {
        return __BaseDAO__.__save__(item);
    }

    static async create(item) {
        return __BaseDAO__.__save__(new GoopenFeatured(item));
    }

    static async get() {
        const featuredQueue = await __BaseDAO__.__get__(GoopenFeatured, {
            isFeaturedQueue: true,
        });
        if (!featuredQueue) {
            const newFeaturedQueue = await this.create({
                isFeaturedQueue: true,
            });
            return newFeaturedQueue;
        }
        return featuredQueue;
    }
}

export default GoopenFeaturedDAO;
