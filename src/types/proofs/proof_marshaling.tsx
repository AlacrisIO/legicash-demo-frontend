/**
 * Logic related to marshaling of merkle-proof steps
 *
 * This is necessary because we need to compute hashes of the marshaled values.
 */

import * as S from '../../util/serialization'
import * as T from './proof_types'

/** Return the serialized tag associated with `t` */
const tag = (t: string): string => S.hexToBinaryUInt(t, 16)

/** Marshaled string for `s`, given the prior `digest` */
const skipMarshal = (s: T.ISkip, height: number, digest: string): string => [
    tag('83'),
    S.hexToBinaryUInt(height.toString(16), 16),
    S.hexToSizedHex(s.bits, 64),  // Corresponds to "Key" on backend skip type
    S.hexToBinaryUInt(s.length, 16),
    S.hexToBinaryUInt(digest, 256)
].join()

/** Marshaled string for `b`, given the prior `digest` on the left */
const leftBranchMarshal = (b: T.ILeftBranch, digest: string): string =>
    S.hexToBinaryUInt(digest, 256) + S.hexToBinaryUInt(b.right as string, 256)

/** Marshaled string for `b`, given the prior `digest` on the right */
const rightBranchMarshal = (b: T.IRightBranch, digest: string): string =>
    S.hexToBinaryUInt(b.left as string, 256) + S.hexToBinaryUInt(digest, 256)

/** Marshaled string for `b`, given the prior `digest` */
const branchMarshal = (b: T.IBranch, height: number, digest: string): string => [
    tag('82'),
    S.hexToBinaryUInt(height.toString(16), 16),
    T.isLeftBranch(b as T.ILeftBranch)
        ? leftBranchMarshal(b as T.ILeftBranch, digest)
        : rightBranchMarshal(b as T.IRightBranch, digest)
].join()

/** Marshaled string for `s`, given the prior `digest` and `height` */
export const stepMarshal = (s: T.step, height: number, digest: string): string =>
    T.isSkip(s) ? skipMarshal(s as T.ISkip, height, digest)
        : branchMarshal(s as T.IBranch, height, digest)

