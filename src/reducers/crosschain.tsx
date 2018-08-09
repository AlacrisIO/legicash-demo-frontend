import * as Actions from '../types/actions'
import { UIState } from '../types/state'
import { Transaction } from '../types/tx'

export const addTx = (state: UIState, a: Actions.ICrossChainValidated): UIState =>
    state.addTx(a.serverResponse as Transaction)
        // Take the balance as reported by the server as canonical, EVEN
        // IF it doesn't match our perceptions. XXX: Some prominent warning
        // should be made when this happens.
        .setIn(['accounts', a.tx.to, 'offchainBalance'], a.newBalance)

export const rejectTx = (state: UIState, a: Actions.ICrossChainFailed): UIState =>
    state.rejectTx(a.tx.multiUpdateIn([
        [['rejected'], (x: any) => true],
        [['failureMessage'], (x: any) => a.serverResponse.message]
    ]))
