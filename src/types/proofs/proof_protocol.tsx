/** Logic related to validation of merkle proofs */

import { keccak256 } from 'js-sha3'

import * as S from '../../util/serialization'
import * as M from './proof_marshaling'
import * as T from './proof_types'

/** True iff `s` has the right shape for a skip step. */
const skipWellFormed = (s: T.ISkip) => S.uInt(s.bits, 64) && S.uInt(s.length, 16)

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
            digest = keccak256(M.stepMarshal(cstep, height, digest))
            digests.push(digest)
        }
        return digests
    }

/** True iff `steps` are well-formed and lead to `root` digest */
const stepsWellFormed = (
    steps: T.step[], initialDigest: string, root: string): boolean => {
    if (!steps.every(stepWellFormed)) { return false }
    const intermediateDigests = stepsIntermediateDigests(steps, initialDigest)
    return intermediateDigests.slice(-1)[0].toString() === root.toString()
}

/** True iff server response `r` is well-formed and valid. */
export const responseWellFormed = (r: T.IResponse, iDigests: string[]): boolean =>
    // XXX: Need to validate that `r.leaf` comes from expected tx!
    S.uInt(r.key, 64) && S.uInt(r.leaf, 256) && S.uInt(r.trie, 256)
    && stepsWellFormed(r.steps, /* iDigests, */ r.leaf, r.trie)
