import { keccak256 } from 'js-sha3'
import { HashValue } from './hash'

/** Represents one layer in a Merkle proof */
export class MerkleProofLayer {
    /** Whether the relevant child is left or right (0 means left.) */
    public readonly child: boolean;
    /** Left hash value at this point in the Merkle tree */
    public readonly left: HashValue;
    /** Right hash value at this point in the Merkle tree */
    public readonly right: HashValue;

    constructor(props: { left: HashValue; right: HashValue; child: boolean }) {
        Object.assign(this, props)
        Object.freeze(this)
    }

    /** 
     * The hash of the concatenation of these hashes.
     *
     * XXX: This needs to be adapted to whatever scheme is used on the backend.
     */
    public nextHash(): HashValue {
        return new HashValue(
            '0x' + keccak256(this.left.toString() + this.right.toString()))
    }

    /** The parent/leaf hash in the path through the tree */
    public targetHash(): HashValue { return this.child ? this.right : this.left }
}

