var hash_regexp = RegExp("^0x([0-9A-Fa-f]{2}){32}$|^$")

/** Represents a 256-bit hash value as a hexadecimal string */
export class HashValue {
    /** The hexadecimal representation */
    readonly hash: string
    constructor(hash: string) {
        if (!hash_regexp.test(hash)) { throw "Bad hash: " + hash }
        this.hash = hash
    }
    public toString(): string { return `HashValue(${this.hash})` }
    public equal(o: HashValue): Boolean { return (this.hash == o.hash) }
}

export var empty_hash = new HashValue('')
