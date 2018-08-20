/** Logic related to validation of merkle proofs */

import * as S from '../../util/serialization'
import * as M from './proof_marshaling'
import * as T from './proof_types'

const sixty_four_bit: number = 2 ** 64

/** True iff `s` has the right shape for a skip step. */
const skipWellFormed = (s: T.ISkip) =>
    S.uInt(s.bits, 64) && (s.length < sixty_four_bit)

/** True iff `b` has the right shape for a left-branch step. */
const leftBranchWellFormed = (b: T.ILeftBranch): boolean =>
    b.type === 'Left'
    && (b.left === undefined)
    && (b.right !== undefined)
    && S.uInt(b.right, 256)

/** True iff `b` has the right shape for a right-branch step. */
const rightBranchWellFormed = (b: T.IRightBranch): boolean =>
    (b.type === 'Right')
    && (b.left !== undefined)
    && S.uInt(b.left, 256)
    && (b.right === undefined)

/** True iff `b` has the right shape for a branch step. */
const branchWellFormed = (b: T.IBranch): boolean =>
    leftBranchWellFormed(b as T.ILeftBranch)
    || rightBranchWellFormed(b as T.IRightBranch)

/** Return true iff `s` has the right shape for a step. */
const stepWellFormed = (s: T.step) =>
    T.isSkip(s) ? skipWellFormed(s as T.ISkip) : branchWellFormed(s as T.IBranch)

/** Digests from intermediate `steps` of proof starting with `initialDigest` */
const stepsIntermediateDigests =
    (steps: T.step[], initialDigest: string): string[] => {
        const digests: string[] = []
        let digest = initialDigest
        let height = 0
        for (const cstep of steps) {
            height += T.isSkip(cstep) ? parseInt((cstep as T.ISkip).length, 16) : 1
            digest = M.stepDigest(cstep, height, digest)
            digests.push(digest)
        }
        return digests
    }

/**
 * Validated proof iif `steps` are well-formed and lead to `trie` digest.
 * False, otherwise.
 */
const validProof = (r: T.IResponse): false | T.IValidatedResponse => {
    const intermediateDigests = stepsIntermediateDigests(r.steps, r.leaf)
    return (intermediateDigests.slice(-1)[0].toString() === r.trie)
        && { ...r, validationSteps: intermediateDigests }
}

/**
 * Validated proof iff server response `r` is well-formed and valid.
 * False otherwise.
 */
export const responseWellFormed = (r: T.IResponse): T.IValidatedResponse | Error => {
    // XXX: Need to validate that `r.leaf` comes from expected tx!
    if (!S.uInt(r.key, 64)) {
        return Error(`key ${r.key} not a 64-bit hexadecimal`)
    }
    if (!S.uInt(r.leaf, 256)) {
        return Error(`leaf ${r.leaf} not a 256-bit hexadecimal`)
    }
    if (!S.uInt(r.trie, 256)) {
        return Error(`trie ${r.trie} not a 256-bit hexadecimal`)
    }
    if (!r.steps.every(stepWellFormed)) {
        return Error(`steps ill-formed!
${JSON.stringify(r.steps.filter(s => !stepWellFormed(s)))}`)
    }
    const proof = validProof(r)  /* Last because real work! (langsec) */
    if (!proof) {
        const digests = stepsIntermediateDigests(r.steps, r.leaf)
        return Error(`Final digest in ${digests} does not match root ${r.trie}`)
    }
    return proof
}
