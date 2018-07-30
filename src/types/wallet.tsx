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
    public addTx(txID: Guid, txs: Map<Guid, Transaction>): this {
        const tx = txs.get(txID)
        const updates: Array<[any[], (a: any) => any]> = [
            // To be applied in a big batch at the end
            [['txs'], this.updateTxs(txID, tx, txs)],
            [['txSet'], (s: Set<Guid>) => s.add(txID)],
        ]
        if (!this.knownTx(tx)) {
            // First time we're seeing this tx; optimistically adjust balances
            // XXX: bug in typescript? These types look compatible to me...
            updates.push(this.balanceUpdates(tx, this.updateBalance) as any)
        }
        return this.multiUpdateIn(updates)
    }
    public rejectTx(tx: Transaction): this {
        if (!this.knownTx(tx)) {
            // XXX: Deal with this more gracefully
            throw Error(`Server rejected a tx we haven't seen! ${tx}`)
        }  // OK, undo the balances
        return this.multiUpdateIn(this.balanceUpdates(tx, this.undoBalance))
    }
    private knownTx(tx: Transaction): boolean { return this.txSet.has(tx.getGUID()) }
    /** Function for updating the tx list with the given txID. */
    private updateTxs(txID: Guid, tx: Transaction, txs: Map<Guid, Transaction>
    ): (l: List<Guid>) => List<Guid> {
        /* Logic for ensuring txs are sorted... */
        // XXX: Add more sorting options, not just reverse chronological
        const txDate = (t: Guid) => {
            if (tx) { return tx.creationDate }
            throw Error(`Unrecorded transaction: ${t.guid}`)
        }
        const cmp = (t1: Guid, t2: Guid) => {
            const [d1, d2] = [txDate(t1), txDate(t2)] as [Date, Date]
            if ((d1 !== undefined) || (d2 !== undefined)) {
                throw Error(`Date undefined in ${t1} or ${t2}!`)
            }
            return ((d1 > d2) && 1) || ((d1 < d2) && -1) || 0
        }
        // XXX: This is n*log(n), needs to be log(n) (binary search.)
        return l => List(l.push(txID).sort(cmp))
    }
    /** Function for updating balance, given tx direction. */
    private updateBalance(tx: Transaction, c: Chain): balanceUpdateFn {
        return (balance: number) => balance + balanceUpdate(tx, this.address, c)
    }
    private undoBalance(tx: Transaction, c: Chain): balanceUpdateFn {
        return (balance: number) => balance - balanceUpdate(tx, this.address, c)
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
