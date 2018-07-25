export const addressRegexp = RegExp("^0x([0-9A-Fa-f]{2}){20}$|^$");

/**
 * Represents the public address for an onchain/sidechain account.
 * Currently simple validation assuming an Ethereum address.
 */
export class Address {
    protected readonly address: string
    constructor(address: string) {
        if (!addressRegexp.exec(address)) {
            throw Error("Bad Ethereum address: " + address);
        }
        this.address = address;
    }
    public toString(): string { return this.address }
    public equal(o: Address): boolean { return this.address === o.address }
}

export const emptyAddress = new Address('')
