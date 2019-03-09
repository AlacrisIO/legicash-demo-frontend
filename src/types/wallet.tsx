import {Address, emptyAddress} from './address'
import {Guid} from './guid'
import {List, Map, Record, Set} from './immutable'
import {SortedList} from './sorted_list'
import {Transaction} from './tx'
import {Money} from "./units";

export type sortKey = [number, number]  // Revision #, date in ms.

export type TxList = SortedList<Guid, sortKey>

export const keyFn = (tx: Transaction): sortKey =>
    [tx.srcSideChainRevision || tx.dstSideChainRevision || -1,
    (tx.creationDate as Date).getTime()]

export const isKey = (o: any): boolean =>
    // Check that o is an array with two numeric values
    o && (o.constructor === Array) && (o.length === 2) && !(o.some(isNaN))

/** Compare to `sortKey`s. -1 if k1 < k2, 1 if k1 > k2, 0 if equal */
export const cmp = (k1: sortKey, k2: sortKey): (-1 | 0 | 1 | undefined) => {
    // [2, 1534271552822] > [131, 1534271552850], so lexicographic cmp does
    // not work as you wound expect. (It converts the elements to strings,
    // THEN compares lexicographically!!)
    if ((!isKey(k1)) || (!isKey(k2))) { return undefined }
    if (k1[0] < k2[0]) { return -1 }
    if (k1[0] > k2[0]) { return 1 }
    if (k1[1] < k2[1]) { return -1 }
    if (k1[1] > k2[1]) { return 1 }
    return 0
}

/* tslint:disable:object-literal-sort-keys */
const defaultValues = {
    /** Cryptographic address for this account */
    address: emptyAddress,
    /** Balance in this address in the side chain. Cannot be negative. */
    sidechainBalance: new Money('0', 10, 'wei'),
    /** Balance in this address main-chain. Cannot be negative. */
    /** TODO `mainchainBalance` should be `0` but right now our synchronization
     * is incomplete so we fudge the initial value to match what happens during
     * prefunding
     */
    mainchainBalance: new Money('100000000000000000000', 10, 'wei'),
    /** Known transactions for this account */
    // XXX: Key function is broken, because we don't have access to the Txs here
    txs: new SortedList<Guid, sortKey>({
        cmp,
        elements: List(),
        keyFn: (x: any) => { throw Error('Set a real key function!') }
    }),
    txSet: Set<Guid>(),
    /** Human-readable username for this account */
    username: ''
}


export class Wallet extends Record(defaultValues) {
    /** Sort first by revision number, if available, then by local creation date */
    constructor(props: Partial<typeof defaultValues>) {
        super(props)
        this.checkBalances()
        // XXX: Check that all transactions belong to `address`?
    }

    /** Wallet with this tx added */
    public addTx(tx:            Transaction
               , txs:           Map<Guid, Transaction>
               ): this {

        if (tx === undefined) {
            throw Error(`Attempt to add undefined Tx to ${this}!`)
        }

        if (this.knownTx(tx)) { return this }  // No need to update...

        // to be applied in a big batch at the end
        const updates: Array<[any[], (a: any) => any]> = [
            [['txs'], this.updateTxs(tx.localGUID as Guid, tx)],
            [['txSet'], (s: Set<Guid>) => s.add(tx.getGUID())]
        ]

        const rv = this.multiUpdateIn(updates)
        rv.checkBalances()
        return rv
    }
    public rejectTx(tx: Transaction): this {
        if (!this.knownTx(tx)) {
            throw Error(`Server rejected a tx we haven't seen! ${tx} known tx guids: ${this.txs.elements}`);
        }  // OK, undo the balances

        // const updates = this.balanceUpdates(tx, this.undoBalance.bind(this))
        // updates.push([['txSet'], (s: Set<Guid>) => s.remove(tx.getGUID())])
        // const rv = this.multiUpdateIn(updates)
        // // XXX: Provide a means to remove rejected Txs from the display?
        // rv.checkBalances()

        return this;
    }
    private knownTx(tx: Transaction): boolean {
        return this.txs.hasElt(tx.localGUID as Guid, keyFn(tx)) ||
            this.txSet.has(tx.getGUID())
    }

    /** Function for updating the tx list with the given txID. */
    private updateTxs(txID: Guid, tx: Transaction): (l: TxList) => typeof l {
        return (l: TxList): typeof l => {
            return l.add(txID, keyFn(tx))
        }
    }


    private checkBalances(): void {
        if (this.mainchainBalance.isLessThanZero()) { throw Error("Main chain balance negative!") }
        if (this.sidechainBalance.isLessThanZero()) { throw Error("Side chain balance negative!") }
    }
}

export const makeWalletWithTxList = (
    address: Address, allTxs: Set<Guid>, guidMap: Map<Guid, Transaction>, username: string
): Wallet => {
    const thisKeyFn = (g: Guid) => {
        const tx = guidMap.get(g)
        if (tx === undefined) {
            throw Error(`Could not find Guid ${g} in \
${guidMap}. You probably need to pass the sort key explicitly in whatever \
SortedList method you called, because you have the wrong \`this\` value.`)
        }
        return keyFn(tx)
    }
    const txs = new SortedList<Guid, sortKey>({
        cmp, elements: List(allTxs), keyFn: thisKeyFn
    })
    return new Wallet({ address, txs, username })
}
