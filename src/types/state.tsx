import * as Actions from './actions'
import { Address } from './address'
import { DefaultContractState } from './contract_state'
import { Guid } from './guid'
import { List, Map, Record, Set } from './immutable'
import { IResponse } from './proofs/proof_types'
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
    /** Record of latest proofs for each tx, if known */
    proofByGUID: Map<Guid, IResponse | Error>(),
    showProofByGUID: Map<string, boolean>(),
    paymentNotifications: [],
    pendingStates: Map<Address, IPendingState>(),
};

export interface IPendingState {
    deposit: boolean;
    withdrawal: boolean;
    payment: boolean;
}

export const DefaultPendingStates: IPendingState = {deposit: false, withdrawal: false, payment: false};

type PendingStateAction = 'deposit' | 'withdrawal' | 'payment';

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
        ];

        if (!this.displayedAccountsSet.has(address)) {
            updates.push(
                [['displayedAccounts'], (l: List<Address>) => l.push(address)],
                [['displayedAccountsSet'], (s: Set<Address>) => s.add(address)])
        }

        return this.multiUpdateIn(updates)
            .setIn(['pendingStates', address], {...DefaultPendingStates});
    }

    public removeWallet(address: Address): this {
        return this.multiUpdateIn([
            [['displayedAccounts'], (l: List<Address>) =>
                l.remove(l.findIndex((a: Address) => a === address))],
            [['displayedAccountsSet'], (s: Set<Address>) => s.remove(address)],
            [['pendingStates'], (m: Map<Address, IPendingState>) => m.remove(address)]
        ])
    }

    public setPaymentNotifications(txs: string[] = []) {
        this.set('paymentNotifications', txs);
    }

    public getPendingStates(address: Address): IPendingState {
        if (!this.pendingStates.has(address)) {
            this.pendingStates.set(address, {...DefaultPendingStates});
        }

        return this.pendingStates.get(address);
    }

    public setPendingState(action: PendingStateAction, address: Address | undefined, isPending: boolean = true): this {
        if (address && this.pendingStates.has(address)) {
            return this.setIn(
                ['pendingStates', address],
                {...this.getPendingStates(address), ...{[action]: isPending}}
            );
        }

        return this;
    }

    /** State with tx added */
    public addTx(tx: Transaction, updateBalance: boolean = false): this {
        if (tx === undefined) { throw Error("Attempt to add undefined tx") }
        
        if (tx.dstSideChainRevision !== undefined &&
            this.txByDstSideChainRevision.has(tx.dstSideChainRevision)) {
            const oldGUID = this.txByDstSideChainRevision.get(
                tx.dstSideChainRevision)
            tx = tx.set('localGUID', oldGUID)
            tx.assertSameTransaction(this.txByGUID.get(oldGUID))
        }
        if (tx.srcSideChainRevision !== undefined &&
            this.txBySrcSideChainRevision.has(tx.srcSideChainRevision)) {
            const oldGUID = this.txBySrcSideChainRevision.get(
                tx.srcSideChainRevision)
            tx = tx.set('localGUID', oldGUID)
            tx.assertSameTransaction(this.txByGUID.get(oldGUID))
        }
        const updateTx = (otx: Transaction | undefined): Transaction => {
            // XXX: Fail more gracefully on contradiction? Some kind of warning?
            if (otx !== undefined) { tx.assertSameTransaction(otx) }
            return tx
        }
        const updateGUID = (s: Set<Guid> | undefined): Set<Guid> =>
            (s || Set()).add(tx.getGUID())
        const updateWallet = (a: Address) => (w: Wallet | undefined) => {
            const rv = (w || new Wallet({ address: a })).addTx(
                tx, this.txByGUID, updateBalance)
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
    /** State with the tx at `localGUID` updated with the info in `tx` */
    public updateTx(localGUID: Guid, tx: Transaction): this {
        if (tx === undefined) { throw Error("Attempt to update undefined tx") }
        const oldTx = this.txByGUID.get(localGUID)
        tx.assertNoErasure(oldTx)
        tx = tx.set('localGUID', localGUID)  // Store this tx info under the old location
        return this.setIn(['txByGUID', localGUID], tx)
            .multiUpdateIn(this.sideChainRevisions(tx))
    }
    /* State with new balances for displayed wallets */
    public updateBalances(balances: Actions.IBalances) {
        const updates: updatesType = []  // Update for each observed new balance
        Object.keys(balances).forEach((address: string) => {
            const asAddress = new Address(address)
            if (this.displayedAccountsSet.has(asAddress)) {
                /* This wallet is displayed, so update its balance */
                const bals = balances[address]

                updates.push(
                    [ ['accounts', asAddress, 'offchainBalance']
                    , _ => bals.side_chain_account.account_state.balance
                    ])

                updates.push(
                    [ ['accounts', asAddress, 'onchainBalance']
                    , _ => bals.main_chain_account.balance
                    ])

            }
        })
        return this.multiUpdateIn(updates)
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
    /** Remove any proof for given tx, anticipating a new one */
    public removeProof(tx: Transaction): this {
        return this.removeIn(['proofByGUID', tx.getGUID()])
    }
    /** Remove any proof for given tx, anticipating a new one */
    public toggleProof(tx: Transaction, owner: string): this {
        return this.updateIn(['showProofByGUID', tx.getGUID().guid + owner], () => !!!this.showProofByGUID.get(tx.getGUID().guid + owner))
    }
    public addProof(tx: Transaction, response: IResponse | Error): this {
        return this.updateIn(['proofByGUID', tx.getGUID()], () => response)
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
                if (g) { oldTx.assertNoErasure(tx) }
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
