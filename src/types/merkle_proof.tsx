import { List } from 'immutable'
import { keccak256 } from 'js-sha3'
import { HashValue, empty_hash } from './hash'

/** Represents one layer in a Merkle proof */
export class MerkleProofLayer {
    /** Left hash value at this point in the Merkle tree */
    readonly left: HashValue;
    /** Right hash value at this point in the Merkle tree */
    readonly right: HashValue;
    /** Whether the relevant child is left or right (0 means left.) */
    readonly child: Boolean;

    constructor(props: { left: HashValue; right: HashValue; child: Boolean }) {
        Object.assign(this, props)
        Object.freeze(this)
    }

    /** The hash of the concatenation of these hashes. */
    next_hash(): HashValue {
        return new HashValue(
            '0x' + keccak256(this.left.hash + this.right.hash))
    }

    /** The parent/leaf hash in the path through the tree */
    target_hash(): HashValue { return this.child ? this.right : this.left }
}

/** Represents a Merkle proof */
export class MerkleProof {

    /** The root Merkle tree commitment */
    readonly root: HashValue;
    /** Layers in the Merkle proof that root contains the leaf
      *
      * Leaf is the indicated HashValue in the first entry in the proof entry,
      * via the`child` attribute. */
    readonly proof: List<MerkleProofLayer>;

    constructor(props: { root: HashValue; proof: List<MerkleProofLayer> }) {
        // Check that the Merkle proof is valid
        var current_hash: HashValue = empty_hash
        props.proof.forEach((layer: MerkleProofLayer) => {
            // `child` true means right child, false means left child.
            if (!current_hash.equal(empty_hash) &&
                !current_hash.equal(layer.target_hash())) {
                this.throw_bad_proof(layer, current_hash, layer.target_hash())
            }
            current_hash = layer.next_hash()
        })
        if (!current_hash.equal(props.root)) {
            throw `Bad Merkle proof; root does not match:
            ${ this}
            Current hash: ${ current_hash} `
        }
        Object.assign(this, props)
        Object.freeze(this)
    }

    throw_bad_proof(
        layer: MerkleProofLayer,
        current_hash: HashValue,
        target_hash: HashValue
    ): void {
        throw `Bad Merkle proof:
                ${ this}
            Current layer: ${ layer}
            Current hash: ${ current_hash}
            Target hash: ${target_hash}`
    }

    leaf_hash(): HashValue { return this.proof.get(0).target_hash() }
}
