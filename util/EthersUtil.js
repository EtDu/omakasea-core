import utils from "ethers/lib/utils.js";

class EthersUtil {
  static toWeiBN({
    amount,
    fromUnit
  }) {
    if (typeof amount != "string") throw new Error("amount must be a string")
    if (typeof fromUnit != "string") throw new Error("fromUnit must be a string!")

    const value = utils.parseUnits(amount, fromUnit)
    return value
  }

  static fromWeiBN({
    amount,
    toUnit
  }) {
    if (typeof amount != "object") throw new Error("amount must be a Big Number object!")
    if (typeof toUnit != "string") throw new Error("toUnit must be a string!")

    const value = utils.formatUnits(amount, toUnit)
    return value
  }

  static sumWeiBN(summation) {
    if (!Array.isArray(summation)) throw new Error("summation must be an array!")

    const sum = summation.reduce((acc, current) => acc.add(current))
    return sum
  }

  static diffWeiBN(subtraction) {
    if (!Array.isArray(subtraction)) throw new Error("subtraction must be an array!")
    
    const diff = subtraction.reduce((acc, current) => acc.sub(current))
    return diff
  }

  static mulWeiBN(multiplication) {
    if (!Array.isArray(multiplication)) throw new Error("multiplication must be an array!")

    const mul = multiplication.reduce((acc, current) => acc.mul(current))
    return mul
  }

  static divWeiBN(division) {
    if (!Array.isArray(division)) throw new Error("division must be an array!")

    const div = division.reduce((acc, current) => acc.div(current))
    return div
  }
}

export default EthersUtil