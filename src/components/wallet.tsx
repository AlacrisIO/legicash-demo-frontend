import * as React from 'react'
import { connect } from 'react-redux'
import { makeDeposit, removeWallet } from '../types/actions'
import { Address } from '../types/address'
import { Guid } from '../types/guid'
import { UIState } from '../types/state'
import { Transaction } from '../types/tx'
import { Wallet as WalletType } from '../types/wallet'
import { TxList } from './tx_list'  // Will need this later...
import { DepositDialog } from './txs/deposit_dialog'

interface IWallet {
    depositCallback: (amount: number) => void
    killCallback: () => void;
    wallet: WalletType;
    txs: Transaction[];
}
export const DumbWallet =
    ({ depositCallback, killCallback, wallet, txs }: IWallet) =>
        <div>
            <h2>
                { /* Clicking on this deletes display of the wallet */}
                <button onClick={killCallback}>⌫</button>
                Username: {wallet.username}
            </h2>
            <p>Address: {wallet.address.toString()}</p>
            <DepositDialog from={wallet.address}
                submitCallback={depositCallback} />
            <p>Offchain balance: {wallet.offchainBalance}</p>
            <p>Onchain balance: {wallet.onchainBalance}</p>
            <p>Transaction list:</p>
            <TxList txs={txs} />
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
                const txs: Transaction[] = wallet.txs.map(
                    (g: Guid) => state.txByGUID.get(g)).toArray()
                return { txs, wallet }
            },
            (dispatch: (a: any) => any) => ({
                depositCallback: (a: number) => {
                    /* tslint:disable:no-console */
                    console.log('Depositing', a)
                    dispatch(makeDeposit(address, a))
                },
                killCallback: () => dispatch(removeWallet(address)),
            })
        )(DumbWallet) 
