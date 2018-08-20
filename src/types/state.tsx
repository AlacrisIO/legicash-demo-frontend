import { Address } from './address'
import { DefaultContractState } from './contract_state'
import { Guid } from './guid'
import { List, Map, Record, Set } from './immutable'
import { Transaction } from './tx'
import { makeWalletWithTxList, Wallet } from './wallet'
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
    txBySrcSideChainRevision: Map<number, Guid>(),  // Revisions strictly monotonic
    txByDstSideChainRevision: Map<number, Guid>(),
    /** Actual store for transactions */
    txByGUID: Map<Guid, Transaction>(),
}

/** Updates to portions of the state are stored as thunks of this form */
type updatesType = Array<[any[], (a: any) => any]>

export class UIState extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        // XXX: Check consistency between tx* members, addresses, etc.
        super(props)
    }
    /** State with wallet added, if necessary. */
    public addWallet(username: string, address: Address): this {
        const updates: updatesType = [
            [['accounts', address],  // Add the wallet to the accounts list
            (w: Wallet) => {
                if (w) { return w }
                const fromTxs = this.txByFromAddress.get(address) || Set()
                const allTxs = fromTxs.union(this.txByToAddress.get(address)
                    || Set())
                return makeWalletWithTxList(
                    address, allTxs, this.txByGUID, username)
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
        const localGUID = this.checkLocalGUID(tx)
        if (localGUID) { tx = tx.set('localGUID', localGUID) }
        // Add tx to GUID map, ensuring compatibility with any extant tx
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
        const updates: updatesType = [
            [['txByGUID', tx.localGUID], updateTx],  // Store tx
            [['txByFromAddress', tx.from], updateGUID],  // Update `from` idx
            [['txByToAddress', tx.to], updateGUID],  // Update `to` idx
            [['accounts'], (wl: Map<Address, Wallet>) =>
                wl.multiUpdateIn([  // Update wallets for `from` & `to` addresses
                    [[tx.to], updateWallet(tx.to)],
                    [[tx.from], updateWallet(tx.from)]
                ])
            ]
        ]
        updates.push(...this.sideChainRevisions(tx)) // Update sidechain indices
        return this.multiUpdateIn(updates)  // Actually do the updates
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
    /**
     * Check whether there's already a localGUID for this based on sidechain 
     * info, and use that if so. NB: assumes strict monotonicity of
     * sidechain revision numbers, which is true as of this writing, per F.
     */
    private checkLocalGUID(tx: Transaction): Guid | undefined {
        let localGUID
        if (tx.srcSideChainRevision !== undefined) {
            localGUID = this.txBySrcSideChainRevision.get(
                tx.srcSideChainRevision)
        }
        if (tx.dstSideChainRevision !== undefined) {
            const dstGUID = this.txByDstSideChainRevision.get(
                tx.dstSideChainRevision)
            if (localGUID && (!localGUID.equals(dstGUID))) {
                throw Error('Incompatible src/dst GUIDs!')
            }
            localGUID = dstGUID
        }
        return localGUID
    }
    /** Calculate updates for the sidechain revision-index indices */
    private sideChainRevisions(tx: Transaction): updatesType {
        const updateSCRevision = (g: Guid | undefined): Guid => {
            if (g !== undefined) {
                const oldTx = this.txByGUID.get(g)
                if (oldTx === undefined) {
                    throw Error(`No tx found for ${g} in ${this.txByGUID} while \
searching for ${tx}!`)
                }
                // Here we are using the fact that the GUID is updated in `addTx`,'
                // when the tx side-chain revisions have been found in the state.
                if (g) { oldTx.assertSameTransaction(tx) }
            }
            return tx.getGUID()
        }
        const updates: updatesType = []
        if (tx.srcSideChainRevision !== undefined) {
            updates.push([['txBySrcSideChainRevision', tx.srcSideChainRevision],
                updateSCRevision])
        }
        if (tx.dstSideChainRevision !== undefined) {
            updates.push([['txByDstSideChainRevision', tx.dstSideChainRevision],
                updateSCRevision])
        }
        return updates
    }
}
