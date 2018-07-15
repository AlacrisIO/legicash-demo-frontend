import { HashValue } from './hash'
import { Address } from './address'

/** Represents a cryptographic transaction */
export class Transaction {

    // There is no need for this to extend the immutable.js Record class,
    // because transactions should never be modified.

    /** Name of the chain this transaction targets. */
    readonly chain: string;
    /** Source address for transaction */
    readonly from: Address;
    /** Destination address for transaction */
    readonly to: Address;
    /** Amount transferred. Cannot be negative. */
    readonly amount: number;
    /** Hash for identifying this tx */
    readonly hash: HashValue
    constructor(props: {
        chain: string; from: Address; to: Address; amount: number;
        hash: HashValue
    }) {
        if (props.amount < 0) { throw "Tx with negative amount!" }
        Object.assign(this, props)
        Object.freeze(this)
    }
}
