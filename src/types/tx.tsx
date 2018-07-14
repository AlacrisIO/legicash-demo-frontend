import { Address } from './address'
import { Record } from 'immutable'

interface ITransaction {
    readonly chain: string,
    readonly from: Address, readonly to: Address,
    readonly amount: number
}

const empty_address = new Address('')

const TransactionRecord = Record({
    chain: '', from: empty_address, to: empty_address, amount: 0
})

/**
 * Represents a transaction. May be on- or offchain.
 */
export class Transaction extends TransactionRecord implements ITransaction {
    /** Name of the chain this transaction targets. */
    readonly chain: string;
    /** Source address for transaction */
    readonly from: Address;
    /** Destination address for transaction */
    readonly to: Address;
    /** Amount transaferred. Cannot be negative. */
    readonly amount: number;
    constructor(props: ITransaction) {
        super(props);
        if (this.amount < 0) { throw "Tx with negative amount!" }
    }
}

