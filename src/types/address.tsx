export const address_regexp = RegExp("^0x([0-9A-Fa-f]{2}){20}$|^$");

/**
 * Represents the public address for an onchain/sidechain account.
 * Currently simple validation assuming an Ethereum address.
 */
export class Address {
    readonly address: string
    constructor(address: string) {
        if (!address_regexp.exec(address)) {
            throw "Bad Ethereum address: " + address;
        }
        this.address = address;
    }
    public toString(): string { return this.address }
}

export const empty_address = new Address('')
