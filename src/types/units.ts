/* tslint:disable:object-literal-sort-keys */
import BigNumber from "bignumber.js";

export const weiInUnits = {
    "wei":          "1",
    "kwei":         "1000",
    "Kwei":         "1000",
    "babbage":      "1000",
    "femtoether":   "1000",
    "mwei":         "1000000",
    "Mwei":         "1000000",
    "lovelace":     "1000000",
    "picoether":    "1000000",
    "gwei":         "1000000000",
    "Gwei":         "1000000000",
    "shannon":      "1000000000",
    "nanoether":    "1000000000",
    "nano":         "1000000000",
    "szabo":        "1000000000000",
    "microether":   "1000000000000",
    "micro":        "1000000000000",
    "finney":       "1000000000000000",
    "milliether":   "1000000000000000",
    "milli":        "1000000000000000",
    "ether":        "1000000000000000000",
    "eth":          "1000000000000000000",
    "kether":       "1000000000000000000000",
    "grand":        "1000000000000000000000",
    "mether":       "1000000000000000000000000",
    "gether":       "1000000000000000000000000000",
    "tether":       "1000000000000000000000000000000"
};

const inputFormat = /^[0-9]+\.?[0-9]*$/;

export const filterEthInput = (value: string): string => {
    value = value.trim();
    if (!value) {
        return '';
    }

    if (inputFormat.test(value)) {
        return value;
    } else {
        return value
            .replace(/[^0-9^.]/g, '')
            .replace(/\.{2,}/g, '.')
            .split('.')
            .reduce(
                (acc, val, i, srcArr) => {
                    if(srcArr.length > 1) {
                       return srcArr[0] + '.' + srcArr[1];
                    }

                    return srcArr[0];
                }
            )
            .replace(/0*((0\.)?\d+)/, '$1')
            .trim()
    }
}

const convert = (value: string, from: string, to: string, round: boolean = false): string => {

    value = value.trim();
    if (!value) {
        return '';
    }

    from = from.toLowerCase();
    to = to.toLowerCase();

    if( !inputFormat.test(value)) {
        throw new Error('Invalid Value for conversion');
    }

    if( Object.keys(weiInUnits).indexOf(from) === -1) {
        throw new Error(`Invalid from unit: ${from}`);
    }

    if( Object.keys(weiInUnits).indexOf(to) === -1) {
        throw new Error(`Invalid from unit: ${from}`);
    }

    if (from === to) {
        return value;
    }

    let result = new BigNumber(value, 10).dividedBy(weiInUnits[to], 10).multipliedBy(weiInUnits[from], 10);

    if (round) {
        result = result.integerValue()
    }

    return result.toString(10);
};

export const wei2eth = (value: string): string => {
    return convert(value, "wei", "eth");
};

export const eth2wei = (value: string): string => {
    return convert(value, "eth", "wei", true);
};

export const decToHex = (val: string): string => {
    return new BigNumber(val, 10).toString(16);
}

export const hexToDec = (val: string): string => {
    return new BigNumber(val, 16).toString(10);
}


export const hexToNumber = (val: string): number => {
    return new BigNumber(val, 10).toNumber();
}


export class Money {
    private unit: 'eth'|'wei';
    private baseValue: number;
    private parsedValue: BigNumber;

    constructor(value: string, base: number = 10, unit: 'eth'|'wei' = 'eth') {
        this.unit = unit;
        this.baseValue = base;
        this.parsedValue = new BigNumber(value, base);
    }

    public getValue(): BigNumber {
        return this.parsedValue;
    }

    public getBase(): number {
        return this.baseValue;
    }

    public toHex() {
        return this.parsedValue.toString(16);
    }

    public toPrefixedHexWei() {
        return '0x' + this.toWei(16);
    }

    public toDec() {
        return this.parsedValue.toString(10);
    }

    public toNumber() {
        return this.parsedValue.toNumber();
    }

    public add(another: Money) {
        this.parsedValue = this.parsedValue.plus(another.getValue(), another.getBase());
        return this;
    }

    public isEqual(another: Money): boolean {
        return this.toWei(16) === another.toWei(16)
    }

    public isLessThanZero() {
        return this.parsedValue.isLessThan(0, 10);
    }

    public isZero() {
        return this.parsedValue.isEqualTo(0, 10);
    }

    public isGreaterThanZero() {
        return this.parsedValue.isGreaterThan(0, 10);
    }

    public toWei(base: number = 10) {
        if (this.unit === 'wei') {
            return this.parsedValue.toString(base);
        } else {
            return new BigNumber(
                eth2wei(this.parsedValue.toString(10)),
                10
            ).toString(base);
        }
    }

    public toEth(base: number = 10) {
        if (this.unit === 'eth') {
            return this.parsedValue.toString(base);
        } else {
            return new BigNumber(
                wei2eth(this.parsedValue.toString(10)),
                10
            ).toString(base);
        }
    }
}

export default convert;
