import * as React from 'react'
import { connect } from 'react-redux'
import {
    makeDeposit, makePayment, makeWithdrawal, removeWallet
} from '../types/actions'
import { Address } from '../types/address'
import { Guid } from '../types/guid'
import { UIState } from '../types/state'
import { Transaction } from '../types/tx'
import { Wallet as WalletType } from '../types/wallet'
import { TxList } from './tx_list'  // Will need this later...
import { DepositDialog } from './txs/deposit_dialog'
import { PayDialog } from './txs/pay_dialog'
import { WithdrawDialog } from './txs/withdraw_dialog'

interface IWallet {
    depositCallback: (amount: number) => void
    payCallback: (address: Address, amount: number) => void
    withdrawCallback: (amount: number) => void
    killCallback: () => void;
    wallet: WalletType;
    txs: Transaction[];
}
export const DumbWallet = ({
    depositCallback, withdrawCallback, payCallback, killCallback, wallet, txs
}: IWallet) =>
    <div>
        <h2>
            { /* Clicking on this deletes display of the wallet */}
            <button onClick={killCallback}>⌫</button>
            Username: {wallet.username}
        </h2>
        <p>Address: {wallet.address.toString()}</p>
        <p>Offchain balance: {wallet.offchainBalance}</p>
        <p>Onchain balance: {wallet.onchainBalance}</p>
        <DepositDialog from={wallet.address}
            submitCallback={depositCallback} />
        <WithdrawDialog from={wallet.address}
            submitCallback={withdrawCallback} />
        <PayDialog from={wallet.address} submitCallback={payCallback} />
        <p>Transaction list:</p>
        <TxList txs={txs} />
    </div>

const stateToProps = (address: Address) => (state: UIState) => {
    const wallet = state.accounts.get(address)
    if (wallet === undefined) {
        throw Error(`Wallet for unknown address! ${address}`)
    }
    const txs: Transaction[] = wallet.txs.map(
        (g: Guid): Transaction => state.txByGUID.get(g)).toArray()
    return { txs, wallet }
}

const dispatchToProps = (address: Address) => (dispatch: (a: any) => any) => ({
    depositCallback: (a: number) => dispatch(makeDeposit(address, a)),
    killCallback: () => dispatch(removeWallet(address)),
    payCallback: (to: Address, a: number) => dispatch(makePayment(to, address, a)),
    withdrawCallback: (a: number) => dispatch(makeWithdrawal(address, a)),
})

export const Wallet = ({ address }: { address: Address }) =>
    connect(stateToProps(address), dispatchToProps(address))(DumbWallet) 
