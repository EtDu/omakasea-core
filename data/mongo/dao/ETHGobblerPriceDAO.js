import __BaseDAO__ from "./__BaseDAO__.js";
import ETHGobblerPrice from "../models/ETHGobblerPrice.js";

import ContractPrices from "../../../../blockchain/ContractPrices.js";
import TimeUtil from "../../../util/TimeUtil.js";

class ETHGobblerPriceDAO {
    static latestPrice() {
        return new Promise((resolve, reject) => {
            this.get()
                .then(async (price) => {
                    const updatedAt = Date.now();
                    if (price) {
                        const hoursSince = TimeUtil.diffHours(
                            price.updatedAt,
                            updatedAt,
                        );
                        if (hoursSince > 1) {
                            console.log("updating prices...");
                            const res =
                                await ContractPrices.calculateMitosisThreshold();
                            const feedAmount =
                                await ContractPrices.getFeedAmount();
                            price.data.ethFloorPrice = res.thresholdETH;
                            price.data.feedAmount = feedAmount;
                            price.updatedAt = updatedAt;
                            this.save(price);
                        }

                        resolve(price);
                    } else {
                        const res =
                            await ContractPrices.calculateMitosisThreshold();
                        const feedAmount = await ContractPrices.getFeedAmount();
                        this.create({
                            data: {
                                ethFloorPrice: res.thresholdETH,
                                feedAmount,
                            },
                            updatedAt,
                        })
                            .then((doc) => {
                                resolve(doc);
                            })
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    }

    static get(query = {}) {
        return __BaseDAO__.__get__(ETHGobblerPrice, query);
    }

    static search(query, orderBy = {}) {
        return __BaseDAO__.__search__(ETHGobblerPrice, query, {}, orderBy);
    }

    static create(price) {
        return __BaseDAO__.__save__(new ETHGobblerPrice(price));
    }

    static save(price) {
        price.updatedAt = Date.now();
        return __BaseDAO__.__save__(price);
    }
}

export default ETHGobblerPriceDAO;
