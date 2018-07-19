import { List } from 'immutable'
import { randomHashString } from './common'
import { HashValue } from './hash'
import { MerkleProof } from './merkle_proof'
import { MerkleProofLayer } from './merkle_proof_layer'

const randomHash = () => new HashValue(randomHashString())

const firstLayer = new MerkleProofLayer({
    child: false, left: randomHash(), right: randomHash()
})

const secondLayer = new MerkleProofLayer({
    child: true, left: randomHash(), right: firstLayer.nextHash()
})

describe('Tests of Merkle proof types', () => {
    it('Accepts and stores a sensible Merkle proof', () => {
        return new MerkleProof({
            proof: List([firstLayer, secondLayer]),
            root: secondLayer.nextHash()
        }) && undefined
    })

    it('Rejects bad Merkle proofs', () => {
        expect(() => new MerkleProof({
            proof: List([firstLayer, secondLayer]), root: randomHash()
        })).toThrow()
    })
})
