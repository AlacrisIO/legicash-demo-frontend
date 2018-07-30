import { Address } from './address'
import { DefaultContractState } from './contract_state'
import { Guid } from './guid'
import { List, Map, Record } from './immutable'
import { Transaction } from './tx'
import { Wallet } from './wallet'
/* tslint:disable:object-literal-sort-keys */
const defaultValues = {
    /** Wallets known to the front end */
    accounts: Map<Address, Wallet>(),
    /** Display of current contract state */
    contractState: DefaultContractState,
    /** Wallets currently displayed */
    displayedAccounts: List<Address>(),
    /** Transactions, indexed by various characteristics */
    txByFromAddress: Map<Address, List<Guid>>(),
    txByToAddress: Map<Address, List<Guid>>(),
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
        return this.updateIn(
            ['accounts', address],
            (w: Wallet) => {
                const txs = List<Guid>(this.txByFromAddress.get(address).concat(
                    this.txByToAddress.get(address)))
                return (w || new Wallet({ address, txs }))
                    .set('username', username)  // Allow update of username
            })
    }
    /** State with tx added */
    public addTx(tx: Transaction): this {
        // Add tx to map, ensuring compatibility with any extant tx
        const updateTx = (otx: Transaction | undefined) =>
            // XXX: Fail more gracefully on contradiction? Some kind of warning?
            otx && (tx.assertSameTransaction(otx) || tx)
        const updateGUID = (guid: Guid | undefined) => tx.localGUID
        const updateWallet = (a: Address) => (w: Wallet | undefined) =>
            (w || new Wallet({ address: a })).addTx(
                tx.getGUID(), this.txByGUID)
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
    }

}
