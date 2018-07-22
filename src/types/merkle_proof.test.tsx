import { List } from 'immutable'
import { randomHashString } from './common'
import { HashValue } from './hash'
import { MerkleProof } from './merkle_proof'
import { MerkleProofLayer } from './merkle_proof_layer'

export const randomHash = () => new HashValue(randomHashString())

export const firstLayer = new MerkleProofLayer({
    child: false, left: randomHash(), right: randomHash()
})

export const secondLayer = new MerkleProofLayer({
    child: true, left: randomHash(), right: firstLayer.nextHash()
})

export const merkleProof = new MerkleProof({
    proof: List([firstLayer, secondLayer]),
    root: secondLayer.nextHash()
})

describe('Tests of Merkle proof types', () => {
    it('Accepts and stores a sensible Merkle proof', () => {
        return merkleProof && undefined
    })

    it('Rejects bad Merkle proofs', () => {
        expect(() => new MerkleProof({
            proof: List([firstLayer, secondLayer]), root: randomHash()
        })).toThrow()
    })
})
