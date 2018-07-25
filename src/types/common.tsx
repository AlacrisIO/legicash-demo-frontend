import { randomBytes } from 'crypto'
import { List } from 'immutable'
import { HashValue } from './hash'
import { MerkleProof } from './merkle_proof'
import { MerkleProofLayer } from './merkle_proof_layer'

export const randomHashString = () => '0x' + randomBytes(32).toString('hex')

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

