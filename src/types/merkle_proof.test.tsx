import { List } from 'immutable'
/* tslint:disable:ordered-imports */
import { randomHash, firstLayer, secondLayer, merkleProof } from './common'
import { MerkleProof } from './merkle_proof'

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
