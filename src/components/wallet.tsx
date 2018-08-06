import * as React from 'react'
import { connect } from 'react-redux'
import { makeDeposit, removeWallet } from '../types/actions'
import { Address } from '../types/address'
import { UIState } from '../types/state'
// import { TxList } from './tx_list'  // Will need this later...
import { Wallet as WalletType } from '../types/wallet'
import { DepositDialog } from './txs/deposit_dialog'

interface IWallet {
    depositCallback: (amount: number) => void
    killCallback: () => void;
    wallet: WalletType;
}
export const DumbWallet = ({ depositCallback, killCallback, wallet }: IWallet) =>
    <div>
        <h2>
            <button onClick={killCallback}>⌫</button> { /* Delete affordance */}
            Username: {wallet.username}
        </h2>
        <p>Address: {wallet.address.toString()}</p>
        <DepositDialog from={wallet.address} submitCallback={depositCallback} />

        <p>Offchain balance: {wallet.offchainBalance}</p>
        <p>Onchain balance: {wallet.onchainBalance}</p>
        <p>Transaction list: To be completed</p>
    </div>

export const Wallet =
    ({ address }: { address: Address }) =>
        connect(
            (state: UIState) => {
                const wallet = state.accounts.get(address)
                if (wallet === undefined) {
                    throw Error(`Wallet for unknown address! \
${address}`)
                }
                return { wallet }
            },
            (dispatch: (a: any) => any) => ({
                depositCallback: (a: number) => dispatch(makeDeposit(address, a)),
                killCallback: () => dispatch(removeWallet(address)),
            })
        )(DumbWallet) 
