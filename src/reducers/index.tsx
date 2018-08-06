/** Redux reducer logic */

import * as Actions from '../types/actions'
import { UIState } from '../types/state'

export const rootReducer = (state: UIState, action: Actions.IActionType)
    : UIState => {
    switch (action.type) {
        // Deposit-related actions; see ../types/actions/deposit.tsx
        case Actions.Action.MAKE_DEPOSIT:
            return state.addTx((action as Actions.IMakeDeposit).tx)
        case Actions.Action.DEPOSIT_VALIDATED:
            const a = (action as Actions.IDepositValidated)
            return state.addTx(a.tx)
                // Take the balance as reported by the server as canonical, EVEN
                // IF it doesn't match our perceptions. XXX:? 
                .setIn(['accounts', a.address, 'offchainBalance'], a.newBalance)
        case Actions.Action.DEPOSIT_FAILED:
            return state.rejectTx((action as Actions.IDepositFailed).tx)

        // UI-related actions; see ../types/actions/ui.tsx
        case Actions.Action.ADD_WALLET:
            const addAction = (action as Actions.IAddWallet)
            return state.addWallet(addAction.username, addAction.address)
        case Actions.Action.REMOVE_WALLET:
            return state.removeWallet((action as Actions.IRemoveWallet).address)
    }
    return state
}
