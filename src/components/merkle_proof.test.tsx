import { mount } from 'enzyme'
import * as React from 'react'
import { MerkleProof } from '../types/merkle_proof';
import { merkleProof } from '../types/merkle_proof.test'
import { MerkleProofWait } from './merkle_proof'

it('Takes a MerkleProof promise, and waits for it', () => {
    let completed = false
    // Poll every 1 ms to check whether `completed` has been set.
    const rProofPromise: () => Promise<MerkleProof> = () =>
        new Promise(resolve => setTimeout(() =>
            resolve((completed && merkleProof) || rProofPromise()), 1))
    const proofPromise = rProofPromise()
    const proofObject = <MerkleProofWait proofPromise={proofPromise} />
    const proofDisplay = mount(proofObject)
    expect(proofDisplay.find('.load-merkle').length).toEqual(1)
    completed = true  // Simulate having loaded the proof
    const wait = proofPromise.then(r => {
        proofDisplay.update()  // Force a re-render
        expect(proofDisplay.find('.load-merkle').length).toEqual(0)
        expect(proofDisplay.find('table').length).toEqual(1)
    })
    return Promise.all([wait])
})

it('Displays an error when the promise fails', () => {
    // This is overall a fragile test, and probably implies that I need to
    // redesign. Creates a proofPromise, which fails, and verifies that the
    // failure message appears in the MerkleProofWait component afterwards.
    //
    // Jest likes to capture the unhandled error. Usually, this would be a good
    // thing, but when you're explicitly testing failure it's a pain in the neck
    const failureMessage = 'failure!'
    let failed = false
    const rProofPromise: any = () =>
        (new Promise((resolve, reject) => setTimeout(() => {
            // NB: If there's an exception raised on this line by jest, the
            // failure is actually probably in checkReRender below.
            if (failed) { reject(Error(failureMessage)) }
            return resolve(rProofPromise())
        }, 1)))
    const proofPromise = rProofPromise()
    expect(proofPromise).rejects.toEqual(Error(failureMessage))
    const proofDisplay = mount(<MerkleProofWait proofPromise={proofPromise} />)
    const awaitRender: () => Promise<boolean> = () =>
        new Promise((resolve, reject) => {
            const checkReRender = () => {
                if (proofDisplay.render().toString().includes(failureMessage)) {
                    resolve(true)  // Update has occurred as expected
                } else { resolve(false) }
            }
            // This is fragile... Too long, and jest raises proofPromise's 
            // unhandled rejection as an exception. Too short, and the
            // component doesn't have time to re-render
            setTimeout(checkReRender, 0.01)
        })
    const caughtPromise = proofPromise.catch((e: Error) => awaitRender())
    failed = true  // Simulate failure
    expect(caughtPromise).resolves.toEqual(true)  // See checkReRender
    return caughtPromise
})
