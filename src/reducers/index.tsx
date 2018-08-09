/** Redux reducer logic */

import * as Actions from '../types/actions'
import { UIState } from '../types/state'
import { addTx, rejectTx } from './crosschain'

export const rootReducer = (state: UIState, action: Actions.IActionType)
    : UIState => {
    switch (action.type) {
        // Deposit-related actions; see ../types/actions/cross_chain_txs.tsx
        case Actions.Action.MAKE_DEPOSIT:
            return state.addTx((action as Actions.IMakeDeposit).tx)
        case Actions.Action.DEPOSIT_VALIDATED:
            return addTx(state, action as Actions.ICrossChainValidated)
        case Actions.Action.DEPOSIT_FAILED:
            return rejectTx(state, action as Actions.ICrossChainFailed)

        // Withdrawal-related actions; see ../types/actions/cross_chain_txs.tsx
        case Actions.Action.MAKE_WITHDRAWAL:
            return state.addTx((action as Actions.IMakeWithdrawal).tx)
        case Actions.Action.WITHDRAWAL_VALIDATED:
            return addTx(state, action as Actions.ICrossChainValidated)
        case Actions.Action.WITHDRAWAL_FAILED:
            return rejectTx(state, action as Actions.ICrossChainFailed)

        // UI-related actions; see ../types/actions/ui.tsx
        case Actions.Action.ADD_WALLET:
            const addAction = (action as Actions.IAddWallet)
            return state.addWallet(addAction.username, addAction.address)
        case Actions.Action.REMOVE_WALLET:
            return state.removeWallet((action as Actions.IRemoveWallet).address)
    }
    return state
}
