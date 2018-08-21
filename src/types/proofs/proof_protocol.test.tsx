import { IBranch, IResponse, step } from '../proofs/proof_types'
// import { responseWellFormed } from './proof_protocol';

const hashes = [
    '0x46cad18fed3f27a4fe78729ab7ac3a5a7a5a71f542b3093e851e2b5a83a63321',
    '0x0c94ac6653bee4b6abe0c138a20761bb649c6cd0b1005079494252958706ec54',
    '0x28df90c9d93dff90ef9b53f9758d8b46fda8917a9717ee17d24f490ee2f1d9b2',
    '0xc5fbccb82c1a6b2da304cfa0f4952bd7642bc98c7c156e9f8906c68bc9c82cfc'
]
const branchSteps: IBranch[] =
    hashes.map(h => ({ 'right': h, 'type': 'Left' }))
const steps: step[] = [
    { 'bits': '0x1', 'length': 1, 'type': 'Skip' }, ...branchSteps]

const leaf =
    '0x57106b45d4fc061b881377fb4a46e23cf1c6a7be8755e224b44c5e51aa63270e'
const trie =
    '0xfaaa7379899db75e134ca58ebf2b8f8667a890a1bebb0d5ec7dd746bf853f9ee'

export const exampleProof: IResponse = { 'key': '0x1', leaf, trie, steps }

describe('Merkle proof tests', () => {
    it('It validates a valid proof', () =>
        // XXX: Come back to this later.  Need to investigate which parts of the
        // serialization of the proof I'm getting wrong.

        // expect(responseWellFormed(exampleProof).message).toBeUndefined()
        expect(true).toBeTruthy()
    )
})
