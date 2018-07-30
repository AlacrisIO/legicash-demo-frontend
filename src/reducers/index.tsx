/** Redux reducer logic */

import * as Actions from '../types/actions'
import { UIState } from '../types/state'

export const rootReducer = (state: UIState, action: Actions.IActionType)
    : UIState => {
    switch (action.type) {
        // Deposit-related actions; see ../types/actions/deposit.tsx
        case Actions.Action.ADD_ADDRESS:
            const addAction = (action as Actions.IAddAddress)
            return state.addWallet(addAction.username, addAction.address)
        case Actions.Action.MAKE_DEPOSIT:
            return state.addTx((action as Actions.IMakeDeposit).tx)
        case Actions.Action.DEPOSIT_VALIDATED:
            return state.addTx((action as Actions.IDepositValidated).tx)
        case Actions.Action.DEPOSIT_FAILED:
            return state.rejectTx((action as Actions.IDepositFailed).tx)
    }
    throw Error('Unkown action received!')
}
