import { Record } from 'immutable'
import { Address, emptyAddress } from './address'
import { emptyHash, HashValue } from './hash'

/* XXX: Should have something in Transaction to indicate who the facilitator
 * is, for sidechain transactions? What about epistemic state?
 */

export interface ITransaction {
    /** Amount transferred. Cannot be negative. */
    readonly amount: number | undefined;
    /** Name of the chain this transaction targets. */
    readonly dstChain: string;
    /** Human-readable explanation for any failure of the transaction */
    readonly failureMessage: string,
    /** Source address for transaction */
    readonly from: Address;
    /** Hash for identifying this tx */
    readonly hash: HashValue
    /** Whether the transaction has been rejected by the facilitator */
    readonly rejected: boolean | undefined;
    /** Name of the chain this transaction comes from */
    readonly srcChain: string;
    /** Destination address for transaction */
    readonly to: Address;
    /** Whether the transaction has been validated by the main chain. */
    readonly validated: boolean | undefined;
}

const defaultTransactionBase = {
    amount: undefined, dstChain: '', failureMessage: '', from: emptyAddress,
    hash: emptyHash, rejected: undefined, srcChain: '', to: emptyAddress,
    validated: undefined,
}

export const DefaultTransaction = Record(defaultTransactionBase)

/** Represents a cryptographic transaction */
export class Transaction extends DefaultTransaction {

    /** Amount transferred. Cannot be negative. */
    public readonly amount: number;
    /** Name of the chain this transaction targets. */
    public readonly dstChain: string;
    /** Human-readable explanation for any failure of the transaction */
    public readonly failureMessage: string;
    /** Source address for transaction */
    public readonly from: Address;
    /** Hash for identifying this tx */
    public readonly hash: HashValue
    /** Name of the chain this transaction comes from */
    /** Whether the transaction has been rejected by the facilitator */
    public readonly rejected: boolean | undefined;
    public readonly srcChain: string;
    /** Destination address for transaction */
    public readonly to: Address;
    /** Whether the transaction has been validated by the main chain. */
    public validated: boolean;

    constructor(props: ITransaction) {
        super(props)
        if (props.amount && (props.amount < 0)) {
            throw Error("Tx with negative amount!")
        }
        Object.freeze(this)  // Close to addition of other attributes
    }
}

/* This is unnecessary due to Record boilerplate, which checks statically that
 * all attributes have been assigned.
 *
 * const dummyTransaction = DefaultTransaction().toSeq()
 *
 * dummyTransaction.forEach(
 *    // Check that all values are specified
 *    (v: ITransaction[keyof ITransaction], k: keyof ITransaction) => {
 *        if (v === props[k]) {  // Key still set to default value?
 *            throw Error(`Transaction key ${k} unset!`)
 *            return false
 *        }
 *        return true // forEach Halts if false is  returned.
 *    })
 */
