import { Record, List } from 'immutable'
import { Transaction } from './tx'
import { Address } from './address'

interface IWallet {
    readonly username: string;
    readonly address: Address;
    readonly onchain_balance: number;
    readonly offchain_balance: number;
    readonly txs: List<Transaction>;
}

const WalletRecord = Record({
    username: '', onchain_balance: 0, offchain_balance: 0, txs: List()
})

/**
 * Represents an onchain/offchain wallet (They both use the same address.)
 * XXX: Should add bond state, etc.
 */
export class Wallet extends WalletRecord implements IWallet {
    /** Human-readable username for this account */
    readonly username: string;
    /** Cryptographic public address for this account */
    readonly address: Address;
    /** Balance in this address on-chain. Cannot be negative. */
    readonly onchain_balance: number;
    /** Balance in this address in the side chain. Cannot be negative. */
    readonly offchain_balance: number;
    /** Known transactions for this account */
    readonly txs: List<Transaction>;
    constructor(props: IWallet) {
        super(props);
        if (this.onchain_balance < 0) { throw "Onchain balance negative!" }
        if (this.offchain_balance < 0) { throw "Offchain balance negative!" }
        // XXX: Check that all transactions belong to `address`?
    }
}
