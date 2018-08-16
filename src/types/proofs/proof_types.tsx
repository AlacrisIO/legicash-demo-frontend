/** Types for merkle proofs from server */

/** Represents a skip node in the Merkle tree */
export interface ISkip {
    /** Path through the nodes. Hex representation of 64 bits. */
    bits: string
    /**
     * Length of the path. E.g., if there are leading zero bits.
     * Hex representation of 64 bits
     */
    length: string
}

/** Represents a single step through a node with one child occupied */
export interface IBranch {
    /** Whether the just-calculated goes on the left or the right */
    type: 'Left' | 'Right'
    /**
     * The supplied hash. Key indicates whether it goes on the left or right of
     * the concatenation for the hash at the next level. So it should always be
     * the opposite of `type`.
     */
    left: string | undefined
    right: string | undefined
}

export interface ILeftBranch extends IBranch { type: 'Left', left: undefined }
export interface IRightBranch extends IBranch { type: 'Right', right: undefined }

export type step = ISkip | IBranch

/** Represents the response from the proof endpoint */
export interface IResponse {
    /** The facilitator revision number for this leaf. Hex representation */
    key: string
    /** Hash value for the leaf. Hex representation */
    leaf: string
    /** Merkle root commitment. Hex representation */
    trie: string
    /** Successive levels of the proof */
    steps: step[]
}

/** true iff `s` is an `ISkip`  */
export const isSkip = (s: any): boolean => (s as ISkip).bits !== undefined

/** true iff `s` is an `ILeftBranch` */
export const isLeftBranch = (s: any): boolean => (s as ILeftBranch).type === 'Left'
