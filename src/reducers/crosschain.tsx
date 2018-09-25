import * as Actions from '../types/actions'
import { Guid } from '../types/guid'
import { UIState } from '../types/state'
import { Transaction } from '../types/tx'

// XXX: Add onchain balance here, when it is available
export const updateTx = (state: UIState, a: Actions.ICrossChainValidated): UIState =>
    state.updateTx((a.tx.localGUID as Guid), a.serverResponse as Transaction)
        // Take the balance as reported by the server as canonical, EVEN
        // IF it doesn't match our perceptions. XXX: Some prominent warning
        // should be made when this happens.
        .setIn(['accounts', a.tx.to, 'offchainBalance'], a.newBalance)

export const rejectTx = (state: UIState, a: Actions.ICrossChainFailed): UIState =>
    state.rejectTx(a.tx.multiUpdateIn([
        [['rejected'], (x: any) => true],
        [['failureMessage'], (x: any) => a.serverResponse.message]
    ]))
