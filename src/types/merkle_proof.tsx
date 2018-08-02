import { List } from 'immutable'
import { emptyHash, HashValue } from './hash'
import { MerkleProofLayer } from './merkle_proof_layer'

/** Represents a Merkle proof */
export class MerkleProof {

    /**
     * Layers in the Merkle proof that root contains the leaf
     *
     * Leaf is the indicated HashValue in the first entry in the proof entry,
     * via the`child` attribute.
     */
    public readonly proof: List<MerkleProofLayer>;
    /** The root Merkle tree commitment */
    public readonly root: HashValue;
    constructor(props: { root: HashValue; proof: List<MerkleProofLayer> }) {
        // Check that the Merkle proof is valid
        let currentHash: HashValue = emptyHash
        props.proof.forEach((layer: MerkleProofLayer) => {
            // `child` true means right child, false means left child.
            if (!currentHash.equals(emptyHash) &&
                !currentHash.equals(layer.targetHash())) {
                this.throwBadProof(layer, currentHash, layer.targetHash())
            }
            currentHash = layer.nextHash()
        })
        if (!currentHash.equals(props.root)) {
            throw Error(`Bad Merkle proof; root does not match:
            ${ this}
            Current hash: ${ currentHash} `)
        }
        Object.assign(this, props)
        Object.freeze(this)
    }

    public leafHash = () => this.proof.get(0).targetHash()

    private throwBadProof(
        layer: MerkleProofLayer,
        currentHash: HashValue,
        targetHash: HashValue
    ): void {
        throw Error(`Bad Merkle proof:
                ${ this}
            Current layer: ${ layer}
            Current hash: ${ currentHash}
            Target hash: ${targetHash}`)
    }

}
