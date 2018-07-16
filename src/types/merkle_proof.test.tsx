import { List } from 'immutable'
import { HashValue } from './hash'
import { MerkleProofLayer, MerkleProof } from './merkle_proof'
import { random_hash_string } from './common'

const random_hash = () => new HashValue(random_hash_string())

var first_layer = new MerkleProofLayer({
    left: random_hash(), right: random_hash(), child: false
})

var second_layer = new MerkleProofLayer({
    left: random_hash(), right: first_layer.next_hash(), child: true
})

describe('Tests of Merkle proof types', () => {
    it('Accepts and stores a sensible Merkle proof', () => {
        new MerkleProof({
            root: second_layer.next_hash(),
            proof: List([first_layer, second_layer])
        })
    })

    it('Rejects bad Merkle proofs', () => {
        expect(() => new MerkleProof({
            root: random_hash(), proof: List([first_layer, second_layer])
        })).toThrow()
    })
})
