import { Record, List } from 'immutable'
import { keccak256 } from 'js-sha3'

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

var empty_hash = new HashValue('')

interface IMerkleProofLayer {
    readonly left: HashValue;
    readonly right: HashValue;
    readonly child: Boolean;
}

const MerkleProofLayerRecord = Record({
    left: empty_hash, right: empty_hash, child: false
})

/** Represents one layer in a Merkle proof */
export class MerkleProofLayer extends MerkleProofLayerRecord
    implements IMerkleProofLayer {
    /** Left hash value at this point in the Merkle tree */
    readonly left: HashValue;
    /** Right hash value at this point in the Merkle tree */
    readonly right: HashValue;
    /** Whether the relevant child is left or right (0 means left.) */
    readonly child: Boolean;

    next_hash(): HashValue {
        return new HashValue(
            '0x' + keccak256(this.left.toString() + this.right.toString()))
    }
}

interface IMerkleProof {
    readonly root: HashValue;
    readonly proof: List<MerkleProofLayer>;
}

const MerkleProofRecord = Record({ leaf: '', root: '', proof: List() })

/** Represents a Merkle proof */
export class MerkleProof extends MerkleProofRecord implements IMerkleProof {
    /** The root Merkle tree commitment */
    readonly root: HashValue;
    /** Layers in the Merkle proof that root contains the leaf
      *
      * Leaf is the indicated HashValue in the first entry in the proof entry,
      * via the`child` attribute. */
    readonly proof: List<MerkleProofLayer>;
    constructor(props: IMerkleProof) {
        super(props);
        // Check that the Merkle proof is valid
        var current_hash: HashValue = empty_hash
        this.proof.forEach((layer: MerkleProofLayer) => {
            // `child` true means right child, false means left child.
            var target_hash: HashValue = layer.child ? layer.right : layer.left
            if (!current_hash.equal(empty_hash) &&
                !current_hash.equal(target_hash)) {
                this.throw_bad_proof(layer, current_hash, target_hash)
            }
            current_hash = layer.next_hash()
        })
        if (!current_hash.equal(this.root)) {
            throw `Bad Merkle proof; root does not match:
            ${ this}
            Current hash: ${ current_hash} `
        }
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
}
