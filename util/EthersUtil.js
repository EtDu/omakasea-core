import utils from "ethers/lib/utils.js";

class EthersUtil {
    static toWeiBN({ amount, from }) {
        if (typeof amount != "string")
            throw new Error("amount must be a string");
        if (typeof from != "string") throw new Error("from must be a string!");

        const value = utils.parseUnits(amount, from);
        return value;
    }

    static fromWeiBN({ amount, to }) {
        if (typeof amount != "object")
            throw new Error("amount must be a Big Number object!");
        if (typeof to != "string") throw new Error("to must be a string!");

        const value = utils.formatUnits(amount, to);
        return value;
    }

    static sumWeiBN(summation) {
        if (!Array.isArray(summation))
            throw new Error("summation must be an array!");

        const sum = summation.reduce((acc, current) => acc.add(current));
        return sum;
    }

    static diffWeiBN(subtraction) {
        if (!Array.isArray(subtraction))
            throw new Error("subtraction must be an array!");

        const diff = subtraction.reduce((acc, current) => acc.sub(current));
        return diff;
    }

    static mulWeiBN(multiplication) {
        if (!Array.isArray(multiplication))
            throw new Error("multiplication must be an array!");

        const mul = multiplication.reduce((acc, current) => acc.mul(current));
        return mul;
    }

    static divWeiBN(division) {
        if (!Array.isArray(division))
            throw new Error("division must be an array!");

        const div = division.reduce((acc, current) => acc.div(current));
        return div;
    }

    static gtWeiBN(op1, op2) {
        if (typeof op1 != "object" || typeof op2 != "object")
            throw new Error("input values must be Big Numbers!");

        return op1.gt(op2);
    }

    static ltWeiBN(op1, op2) {
        if (typeof op1 != "object" || typeof op2 != "object")
            throw new Error("input values must be Big Numbers!");

        return op1.lt(op2);
    }

    static gteWeiBN(op1, op2) {
        if (typeof op1 != "object" || typeof op2 != "object")
            throw new Error("input values must be Big Numbers!");

        return op1.gte(op2);
    }

    static lteWeiBN(op1, op2) {
        if (typeof op1 != "object" || typeof op2 != "object")
            throw new Error("input values must be Big Numbers!");

        return op1.lte(op2);
    }

    static eqWeiBN(op1, op2) {
        if (typeof op1 != "object" || typeof op2 != "object")
            throw new Error("input values must be Big Numbers!");

        return op1.eq(op2);
    }

    static evDivWeiBN(total, unit) {
        let div = 0;
        let dec = total;
        while (EthersUtil.gtWeiBN(dec, unit)) {
            dec = EthersUtil.diffWeiBN([dec, unit]);
            div++;
        }

        if (EthersUtil.eqWeiBN(dec, unit)) {
            div++;
        }

        return div;
    }
}

export default EthersUtil;
