import { Record, List } from 'immutable'
import { Transaction } from './tx'
import { Address, empty_address } from './address'

/* *****************************************************************************
 * Wallet boilerplate
 *
 * We want Wallet to be a record, because we expect it to change, so having it
 * backed by a persistent data structure will allow for efficient real-time
 * updates. Otherwise, it could just extend Object, like Transaction and
 * MerkleProof */

interface IWallet {
    readonly username: string;
    readonly address: Address;
    readonly onchain_balance: number;
    readonly offchain_balance: number;
    readonly txs: List<Transaction>;
}

const default_wallet: IWallet = {  // Ensure alignment with IWallet attributes
    username: '',
    address: empty_address,
    onchain_balance: 0,
    offchain_balance: 0,
    txs: List()
}

const WalletRecord = Record(default_wallet)

/* End wallet boilerplate
 ******************************************************************************/

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
    /** Force typechecking on get */
    get<T extends keyof IWallet>(value: T): IWallet[T] {
        return super.get(value)
    }
}
