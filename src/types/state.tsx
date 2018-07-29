import { Address } from './address'
import { DefaultContractState } from './contract_state'
import { Guid } from './guid'
import { List, Map, Record } from './immutable'
import { Transaction } from './tx'
import { Wallet } from './wallet'

const defaultValues = {
    /** Wallets known to the front end */
    accounts: Map<Address, Wallet>(),
    /** Display of current contract state */
    contractState: DefaultContractState,
    /** Wallets currently displayed */
    displayedAccounts: List<Address>(),
    /** Transactions, indexed by various characteristics */
    txByFromAddress: Map<Address, List<Guid>>(),
    txByGUID: Map<Guid, Transaction>(),
    txByToAddress: Map<Address, List<Guid>>(),
}

export class UIState extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        // XXX: Check consistency between tx* members, addresses, etc.
        super(props)
    }
    /** State with wallet added */
    public addWallet(username: string, address: Address, onchainBalance?: 0,
        offchainBalance?: 0): this {
        return this.updateIn(
            ['accounts', address],
            (w: Wallet) => {
                const txs = List<Guid>(this.txByFromAddress.get(address).concat(
                    this.txByToAddress.get(address)))
                return (w || new Wallet({
                    address, offchainBalance, onchainBalance, txs, username
                }))
            })
    }
    /** State with tx added */
    public addTx(tx: Transaction): this {
        // Add tx to map, ensuring compatibility with any extant tx
        const updateTx = (otx: Transaction | undefined) =>
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
            ]])
    }
}
