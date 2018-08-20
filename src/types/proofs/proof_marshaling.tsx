/**
 * Logic related to marshaling of merkle-proof steps
 *
 * This is necessary because we need to compute hashes of the marshaled values.
 */

import * as S from '../../util/serialization'
import * as T from './proof_types'

/** Return the serialized tag associated with `t` */
const tag = (t: string): Uint8Array => S.hexToBinaryUInt(t, 16)

/** Marshaled string for `b`, given the prior `digest` on the left */
const leftBranchMarshal = (b: T.ILeftBranch, digest: string): Uint8Array[] =>
    [S.hexToBinaryUInt(digest, 256), S.hexToBinaryUInt(b.right as string, 256)]

/** Marshaled string for `b`, given the prior `digest` on the right */
const rightBranchMarshal = (b: T.IRightBranch, digest: string): Uint8Array[] =>
    [S.hexToBinaryUInt(b.left as string, 256), S.hexToBinaryUInt(digest, 256)]

/** Digest of marshaled string for `b`, given the prior `digest` */
const branchDigest = (b: T.IBranch, height: number, digest: string): string => {
    const marshaling = [tag('0x82'), S.hexToBinaryUInt(S.numToHex(height), 16)]
    marshaling.push(...(T.isLeftBranch(b as T.ILeftBranch)
        ? leftBranchMarshal(b as T.ILeftBranch, digest)
        : rightBranchMarshal(b as T.IRightBranch, digest)))
    return S.keccackHashArrays(marshaling)
}

/** Digest for marshaled string for `s`, given the prior `digest` */
const skipDigest = (s: T.ISkip, height: number, digest: string): string =>
    S.keccackHashArrays([
        tag('0x83'),
        S.hexToBinaryUInt(S.numToHex(height), 16),
        S.hexToBinaryUInt(s.bits, 64),  // Corresponds to "Key" on backend skip type
        S.hexToBinaryUInt(S.numberToHexString(s.length), 16),
        S.hexToBinaryUInt(digest, 256)
    ])

/** Marshaled string for `s`, given the prior `digest` and `height` */
export const stepDigest = (s: T.step, height: number, digest: string): string =>
    T.isSkip(s)
        ? skipDigest(s as T.ISkip, height, digest)
        : branchDigest(s as T.IBranch, height, digest)
