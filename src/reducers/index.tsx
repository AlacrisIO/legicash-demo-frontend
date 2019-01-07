/** Redux reducer logic */

import * as Actions from '../types/actions'
import { UIState } from '../types/state'
import * as Crosschain from './crosschain'
import * as RecentTxs from './recent_txs'

export const rootReducer = (state: UIState, action: Actions.IActionType)
    : UIState => {
    switch (action.type) {
        // XXX: Since the reductions are identical for deposit/withdraw, could
        // fold those events into each other?

        // Deposit-related actions; see ../types/actions/cross_chain_txs.tsx
        case Actions.Action.MAKE_DEPOSIT:
            return state.addTx((action as Actions.IMakeDeposit).tx)
        case Actions.Action.DEPOSIT_VALIDATED:
            return Crosschain.updateTx(state, action as Actions.ICrossChainValidated)
        case Actions.Action.DEPOSIT_FAILED:
            return Crosschain.rejectTx(state, action as Actions.ICrossChainFailed)

        // Withdrawal-related actions; see ../types/actions/cross_chain_txs.tsx
        case Actions.Action.MAKE_WITHDRAWAL:
            return state.addTx((action as Actions.IMakeWithdrawal).tx)
        case Actions.Action.WITHDRAWAL_VALIDATED:
            return Crosschain.updateTx(state, action as Actions.ICrossChainValidated)
        case Actions.Action.WITHDRAWAL_FAILED:
            return Crosschain.rejectTx(state, action as Actions.ICrossChainFailed)

        // Side-chain payment-related actions
        case Actions.Action.PAYMENT_INITIATED:
            return state.addTx((action as Actions.IPaymentAction).tx)
        case Actions.Action.PAYMENT_VALIDATED:
            const { tx } = action as Actions.IPaymentValidated
            return state.updateTx(tx.getGUID(), tx)
        case Actions.Action.PAYMENT_FAILED:
            return state.rejectTx((action as Actions.IPaymentFailed).tx)

        // Facilitator-state-related actions
        case Actions.Action.BALANCES_OBSERVED:
            return state.updateBalances(
                (action as Actions.IBalancesObserved).balances)

        // Transaction query-related actions
        case Actions.Action.RECENT_TRANSACTIONS_INITIATED:
            return state  // XXX: Reflect this in the UI, somehow?
        case Actions.Action.RECENT_TRANSACTIONS_RECEIVED:
            return RecentTxs.addTxs(
                state, (action as Actions.IRecentTxsReceived).txs)
        case Actions.Action.RECENT_TRANSACTIONS_FAILED:
            return RecentTxs.recentTxsFailed(state) // XXX: Reflect in UI??

        // Proof/server interactions
        case Actions.Action.PROOF_RECEIVED_AND_VALID:
            const proofAction = (action as Actions.IProofReceivedAndValid)
            return state.addProof(proofAction.tx, proofAction.proof)
        case Actions.Action.PROOF_RECEIVED_BUT_INVALID:
            const failAction = (action as Actions.IProofReceivedButInvalid)
            return state.addProof(failAction.tx, failAction.response)
        case Actions.Action.PROOF_ERROR:
            const errorAction = action as Actions.IProofError
            return state.addProof(errorAction.tx, errorAction.error)

        // UI-related actions; see ../types/actions/ui.tsx
        case Actions.Action.ADD_WALLET:
            const addAction = (action as Actions.IAddWallet)
            return state.addWallet(addAction.username, addAction.address)
        case Actions.Action.REMOVE_WALLET:
            return state.removeWallet((action as Actions.IRemoveWallet).address)
        case Actions.Action.PROOF_REQUESTED:
            return state.removeProof((action as Actions.IProofRequested).tx)
        case Actions.Action.PROOF_TOGGLED:
            return state.toggleProof((action as Actions.IProofToggle).tx, (action as Actions.IProofToggle).owner)
    }
    return state
}
