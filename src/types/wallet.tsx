import { emptyAddress } from './address'
import { balanceUpdate, Chain } from './chain'
import { Guid } from './guid'
import { List, Map, Record, Set } from './immutable'
import { Transaction } from './tx'

/* tslint:disable:object-literal-sort-keys */
const defaultValues = {
    /** Cryptographic address for this account */
    address: emptyAddress,
    /** Balance in this address in the side chain. Cannot be negative. */
    offchainBalance: 0,
    /** Balance in this address on-chain. Cannot be negative. */
    // XXX: We are effectively agnostic about onchainBalance, at this point.
    onchainBalance: Infinity,
    /** Known transactions for this account. Append only! */
    txs: List<Guid>(),
    txSet: Set<Guid>(),
    /** Human-readable username for this account */
    username: ''
}

// type balanceUpdateFn = (balance: number) => number
type balanceUpdateFn = (balance: any) => any

export class Wallet extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        super(props)
        if (this.onchainBalance < 0) { throw Error("Onchain balance negative!") }
        if (this.offchainBalance < 0) { throw Error("Offchain balance negative!") }
        // XXX: Check that all transactions belong to `address`?
    }
    /** Wallet with this tx added */
    public addTx(tx: Transaction, txs: Map<Guid, Transaction>): this {
        const updates: Array<[any[], (a: any) => any]> = [
            // To be applied in a big batch at the end
            [['txs'], this.updateTxs(tx.localGUID as Guid, tx, txs)],
            [['txSet'], (s: Set<Guid>) => s.add(tx.localGUID as Guid)],
        ]
        if ((tx === undefined) || (!this.knownTx(tx))) {
            updates.push(...this.balanceUpdates(tx, this.updateBalance.bind(this)))
        }
        return this.multiUpdateIn(updates)
    }
    public rejectTx(tx: Transaction): this {
        if (!this.knownTx(tx)) {
            // XXX: Deal with this more gracefully
            throw Error(`Server rejected a tx we haven't seen! ${tx}`)
        }  // OK, undo the balances
        return this.multiUpdateIn(this.balanceUpdates(tx, this.undoBalance.bind(this)))
    }
    private knownTx(tx: Transaction): boolean { return this.txSet.has(tx.getGUID()) }
    /** Function for updating the tx list with the given txID. */
    private updateTxs(txID: Guid, tx: Transaction, txs: Map<Guid, Transaction>
    ): (l: List<Guid>) => List<Guid> {
        /* Logic for ensuring txs are sorted... */
        // XXX: Add more sorting options, not just reverse chronological
        // XXX: This is n*log(n), needs to be log(n) (binary search.)
        // Maybe add a date index to UIState?
        const txa = txs.set(tx.localGUID as Guid, tx)
        return l => {
            return List(
                l.push(txID).sortBy((txid: Guid) => txa.get(txid).creationDate))
        }
    }
    /** Function for updating balance, given tx direction. */
    private updateBalance(tx: Transaction, c: Chain): balanceUpdateFn {
        const address = this.address
        return (balance: number) => balance + balanceUpdate(tx, address, c)
    }
    private undoBalance(tx: Transaction, c: Chain): balanceUpdateFn {
        const address = this.address
        return (balance: number) => balance - balanceUpdate(tx, address, c)
    }
    private balanceUpdates(
        tx: Transaction,
        update: (tx: Transaction, chain: Chain) => balanceUpdateFn
    ): Array<[string[], balanceUpdateFn]> {
        return [
            [['offchainBalance'], update(tx, Chain.Side)],
            [['onchainBalance'], update(tx, Chain.Main)]
        ]
    }
}
