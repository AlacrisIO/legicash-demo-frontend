var address_regexp = RegExp("^0x([0-9A-Fa-f]{2}){20}$|^$");

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
