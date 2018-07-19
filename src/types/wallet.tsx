import { List, Record } from 'immutable'
import { Address, emptyAddress } from './address'
import { Transaction } from './tx'

/* *****************************************************************************
 * Wallet boilerplate
 *
 * We want Wallet to be a record, because we expect it to change, so having it
 * backed by a persistent data structure will allow for efficient real-time
 * updates. Otherwise, it could just extend Object, like Transaction and
 * MerkleProof */

interface IWallet {
    readonly address: Address;
    readonly offchainBalance: number;
    readonly onchainBalance: number;
    readonly txs: List<Transaction>;
    readonly username: string
}

const defaultWallet: IWallet = {  // Ensure alignment with IWallet attributes
    address: emptyAddress,
    offchainBalance: 0,
    onchainBalance: 0,
    txs: List(),
    username: ''
}

const WalletRecord = Record(defaultWallet)

/* End wallet boilerplate
 ******************************************************************************/

/**
 * Represents an onchain/offchain wallet (They both use the same address.)
 * XXX: Should add bond state, etc.
 */
export class Wallet extends WalletRecord implements IWallet {
    /** Human-readable username for this account */
    public readonly username: string;
    /** Cryptographic public address for this account */
    public readonly address: Address;
    /** Balance in this address on-chain. Cannot be negative. */
    public readonly onchainBalance: number;
    /** Balance in this address in the side chain. Cannot be negative. */
    public readonly offchainBalance: number;
    /** Known transactions for this account */
    public readonly txs: List<Transaction>;
    constructor(props: IWallet) {
        super(props);
        if (this.onchainBalance < 0) { throw Error("Onchain balance negative!") }
        if (this.offchainBalance < 0) { throw Error("Offchain balance negative!") }
        // XXX: Check that all transactions belong to `address`?
    }
}
