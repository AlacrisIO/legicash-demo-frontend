import { Address } from './address'
import { HashValue } from './hash'

/* XXX: Should have something in Transaction to indicate who the facilitator
 * is, for sidechain transactions? What about epistemic state?
 */

/** Represents a cryptographic transaction */
export class Transaction {

    // There is no need for this to extend the immutable.js Record class,
    // because transactions should never be modified.

    /** Amount transferred. Cannot be negative. */
    public readonly amount: number;
    /** Name of the chain this transaction targets. */
    public readonly chain: string;
    /** Source address for transaction */
    public readonly from: Address;
    /** Hash for identifying this tx */
    public readonly hash: HashValue
    /** Destination address for transaction */
    public readonly to: Address;
    constructor(props: {
        chain: string; from: Address; to: Address; amount: number;
        hash: HashValue
    }) {
        if (props.amount < 0) { throw Error("Tx with negative amount!") }
        Object.assign(this, props)
        Object.freeze(this)
    }
}
