/** Types for merkle proofs from server */

/** Represents a skip node in the Merkle tree */
export interface ISkip {
    /** Path through the nodes. Hex representation of 64 bits. */
    readonly bits: string
    /**
     * Length of the path. Backend returns a number here, but it's a 64-bit uint
     * representation in its memory.
     */
    readonly length: number
}

/** Represents a single step through a node with one child occupied */
export interface IBranch {
    /** Whether the just-calculated goes on the left or the right */
    readonly type: string  // 'Left' | 'Right'
    /**
     * The supplied hash. Key indicates whether it goes on the left or right of
     * the concatenation for the hash at the next level. So it should always be
     * the opposite of `type`.
     */
    readonly left?: string | undefined
    readonly right?: string | undefined
}

export interface ILeftBranch extends IBranch { type: 'Left', left: undefined }
export interface IRightBranch extends IBranch { type: 'Right', right: undefined }

export type step = ISkip | IBranch

/** Represents the response from the proof endpoint */
export interface IResponse {
    /** The facilitator revision number for this leaf. Hex representation */
    readonly key: string
    /** Hash value for the leaf. Hex representation */
    readonly leaf: string
    /** Merkle root commitment. Hex representation */
    readonly trie: string
    /** Successive levels of the proof */
    readonly steps: step[]
}

/** Represents a respons augmented with validation data, for easy checking */
export interface IValidatedResponse extends IResponse {
    /** The digests computed during the validation process */
    readonly validationSteps: string[]
}

/** true iff `s` is an `ISkip`  */
export const isSkip = (s: any): boolean => (s as ISkip).bits !== undefined

/** true iff `s` is an `ILeftBranch` */
export const isLeftBranch = (s: any): boolean => (s as ILeftBranch).type === 'Left'
