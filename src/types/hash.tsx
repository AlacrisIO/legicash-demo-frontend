const hashRegexp = RegExp("^0x([0-9A-Fa-f]{2}){32}$|^$")

/** Represents a 256-bit hash value as a hexadecimal string */
export class HashValue {
    /** The hexadecimal representation */
    private readonly hash: string
    constructor(hash: string) {
        if (!hashRegexp.test(hash)) { throw Error("Bad hash: " + hash) }
        this.hash = hash
    }
    public toString(): string { return `HashValue(${this.hash})` }
    public toRawString(): string { return this.hash }
    public equal(o: HashValue): boolean { return (this.hash === o.hash) }
}

export const emptyHash = new HashValue('')
