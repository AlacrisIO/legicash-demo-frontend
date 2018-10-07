import * as Actions from '../types/actions'
import { UIState } from '../types/state'

// XXX: See remarks in ./crosschain.tsx#addTx about perceptions
export const addTx = (state: UIState, a: Actions.IPaymentValidated): UIState =>
    state.addTx(a.tx.set('validated', true))

export const rejectTx = (state: UIState, a: Actions.IPaymentFailed): UIState =>
    state.rejectTx(a.tx.multiUpdateIn([
        [['rejected'], (x: any) => true],
        [['failureMessage'], (x: any) => a.error.message],
    ]))
