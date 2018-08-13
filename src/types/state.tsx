import { Address } from './address'
import { DefaultContractState } from './contract_state'
import { Guid } from './guid'
import { List, Map, Record, Set, update } from './immutable'
import { SortedList } from './sorted_list'
import { Transaction } from './tx'
import { Wallet } from './wallet'
/* tslint:disable:object-literal-sort-keys */
const defaultValues = {
    /** Wallets known to the front end */
    accounts: Map<Address, Wallet>(),
    /** Display of current contract state */
    contractState: DefaultContractState,
    /** Wallets currently displayed, in order */
    displayedAccounts: List<Address>(),
    /** Wallets currently displayed, for fast checking */
    displayedAccountsSet: Set<Address>(),
    /** Transactions, indexed by various characteristics */
    txByFromAddress: Map<Address, Set<Guid>>(),
    txByToAddress: Map<Address, Set<Guid>>(),
    /** Actual store for transactions */
    txByGUID: Map<Guid, Transaction>(),
}

export class UIState extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        // XXX: Check consistency between tx* members, addresses, etc.
        super(props)
    }
    /** State with wallet added, if necessary. */
    public addWallet(username: string, address: Address): this {
        const updates: update[] = [
            [['accounts', address],  // Add the wallet to the accounts list
            (w: Wallet) => {
                const fromTxs = this.txByFromAddress.get(address) || Set()
                const allTxs = fromTxs.union(this.txByToAddress.get(address)
                                          || Set())
                const keyFn = (g: Guid) => {
                    const tx = this.txByGUID.get(g)
                    if (tx === undefined) {
                        throw Error(`Could not find Guid ${g} in \
${this.txByGUID}. You probably need to pass the sort key explicitly in whatever \
SortedList method you called, because you have the wrong \`this\` value.`)
                    }
                    return tx.creationDate as Date
                }
                const txs = new SortedList<Guid, Date>({
                    elements: List(allTxs), keyFn
                })
                return (w || new Wallet({ address, txs, username }))
            }]
        ]
        if (!this.displayedAccountsSet.has(address)) {
            updates.push(
                [['displayedAccounts'], (l: List<Address>) => l.push(address)],
                [['displayedAccountsSet'], (s: Set<Address>) => s.add(address)])
        }
        return this.multiUpdateIn(updates)
    }
    public removeWallet(address: Address): this {
        return this.multiUpdateIn([
            [['displayedAccounts'], (l: List<Address>) =>
                l.remove(l.findIndex((a: Address) => a === address))],
            [['displayedAccountsSet'], (s: Set<Address>) => s.remove(address)]
        ])
    }
    /** State with tx added */
    public addTx(tx: Transaction): this {
        if (tx === undefined) { throw Error("Attempt to add undefined tx") }
        // Add tx to map, ensuring compatibility with any extant tx
        const updateTx = (otx: Transaction | undefined): Transaction => {
            // XXX: Fail more gracefully on contradiction? Some kind of warning?
            if (otx !== undefined) { tx.assertSameTransaction(otx) }
            return tx
        }
        const updateGUID = (s: Set<Guid> | undefined): Set<Guid> =>
            (s || Set()).add(tx.getGUID())
        const updateWallet = (a: Address) => (w: Wallet | undefined) => {
            const rv = (w || new Wallet({ address: a })).addTx(tx, this.txByGUID)
            return rv
        }
        return this.multiUpdateIn([
            [['txByGUID', tx.localGUID], updateTx],
            [['txByFromAddress', tx.from], updateGUID],
            [['txByToAddress', tx.to], updateGUID],
            [['accounts'], (wl: Map<Address, Wallet>) =>
                wl.multiUpdateIn([
                    [[tx.to], updateWallet(tx.to)],
                    [[tx.from], updateWallet(tx.from)]
                ])
            ]
        ])
    }
    /** State with tx marked as rejected */
    public rejectTx(tx: Transaction): this {
        return this
            .addTx(tx) // Add the new information about the tx
            // Adjust balances on affected wallets, which were optimistically
            .update('accounts',             // updated when tx was created.
                (wl: Map<Address, Wallet>) => {
                    const updateWallet = (w: Wallet) => w.rejectTx(tx)
                    return wl.multiUpdateIn([
                        [[tx.to], updateWallet],
                        [[tx.from], updateWallet]
                    ])
                })
    }
}
