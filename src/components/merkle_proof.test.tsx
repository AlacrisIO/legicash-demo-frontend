import { mount } from 'enzyme'
import * as React from 'react'
import { merkleProof } from '../types/common'
import { MerkleProofDisplay, MerkleProofWait } from './merkle_proof'

describe('MerkleProofDisplay tests', () => {
    it('Renders a Merkle proof sanely', () => {
        const m = mount(<MerkleProofDisplay proof={merkleProof} />)
        const text = m.text()
        expect(text).toContain('Root')
        expect(text).toContain('Leaf')
    })
})

/* XXX: These are just boilerplate. Really needs some integration tests with the
 * promise machinery. That will have to wait until the overall architecture is
 * clearer.
 */

describe('MerkleProofWait tests', () => {
    it('Renders a MerkleProof, when provided', () => {
        const proofObject =
            <MerkleProofWait result={merkleProof} eventInfo="foo" />
        expect(mount(proofObject).find('table.merkleTable').length).toEqual(1)
    })
    it('Renders an error, when provided', () => {
        const proofObject =
            <MerkleProofWait result={Error("fail!")} eventInfo="f" />
        expect(mount(proofObject).find('.load-merkle-error').length).toEqual(1)
    })
    it('Renders a spinner, when neither is available', () => {
        const proofObject = <MerkleProofWait result={null} eventInfo="f" />
        expect(mount(proofObject).find('.load-merkle').length).toEqual(1)
    })
})
