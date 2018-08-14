import { emptyAddress } from './address'
import { balanceUpdate, Chain } from './chain'
import { Guid } from './guid'
import { List, Map, Record } from './immutable'
import { SortedList } from './sorted_list'
import { Transaction } from './tx'

export type sortKey = [number, Date]

export type TxList = SortedList<Guid, sortKey>

/* tslint:disable:object-literal-sort-keys */
const defaultValues = {
    /** Cryptographic address for this account */
    address: emptyAddress,
    /** Balance in this address in the side chain. Cannot be negative. */
    offchainBalance: 0,
    /** Balance in this address on-chain. Cannot be negative. */
    // XXX: We are effectively agnostic about onchainBalance, at this point.
    onchainBalance: Infinity,
    /** Known transactions for this account */
    // XXX: Key function is broken, because we don't have access to the Txs here
    txs: new SortedList<Guid, sortKey>({ elements: List(), keyFn: (x: any) => x }),
    /** Human-readable username for this account */
    username: ''
}

// type balanceUpdateFn = (balance: number) => number
type balanceUpdateFn = (balance: any) => any

export class Wallet extends Record(defaultValues) {
    public static keyFn(tx: Transaction): sortKey {
        return [tx.srcSideChainRevision || tx.dstSideChainRevision || -1,
        tx.creationDate as Date]
    }
    constructor(props: Partial<typeof defaultValues>) {
        super(props)
        this.checkBalances()
        // XXX: Check that all transactions belong to `address`?
    }
    /** Wallet with this tx added */
    public addTx(tx: Transaction, txs: Map<Guid, Transaction>): this {
        if (tx === undefined) {
            throw Error(`Attempt to add undefined Tx to ${this}!`)
        }
        // To be applied in a big batch at the end
        const updates: Array<[any[], (a: any) => any]> = [
            [['txs'], this.updateTxs(tx.localGUID as Guid, tx)]
        ]
        if (!this.knownTx(tx)) {
            updates.push(...this.balanceUpdates(tx, this.updateBalance.bind(this)))
        }
        const rv = this.multiUpdateIn(updates)
        rv.checkBalances()
        return rv
    }
    public rejectTx(tx: Transaction): this {
        if (!this.knownTx(tx)) {
            // XXX: Deal with this more gracefully
            throw Error(`Server rejected a tx we haven't seen! ${tx}`)
        }  // OK, undo the balances
        const updates = this.balanceUpdates(tx, this.undoBalance.bind(this))
        const rv = this.multiUpdateIn(updates)
        // XXX: Provide a means to remove rejected Txs from the display?
        rv.checkBalances()
        return rv
    }
    private knownTx(tx: Transaction): boolean {
        return this.txs.hasElt(tx.localGUID as Guid, Wallet.keyFn(tx))
    }

    /** Function for updating the tx list with the given txID. */
    private updateTxs(txID: Guid, tx: Transaction): (l: TxList) => typeof l {
        return (l: TxList): typeof l => {
            return l.add(txID, Wallet.keyFn(tx))
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
    private checkBalances(): void {
        if (this.onchainBalance < 0) { throw Error("Onchain balance negative!") }
        if (this.offchainBalance < 0) { throw Error("Offchain balance negative!") }
    }
}
