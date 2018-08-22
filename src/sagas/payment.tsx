import { call, put } from 'redux-saga/effects'
import { post } from '../server/common'
import * as Actions from '../types/actions'
import { Address } from '../types/address'
import { listener } from './common'

export function* payment(action: Actions.IPaymentInitiated) {
    const tx = action.tx
    try {
        const body = {
            amount: tx.amount,
            recipient: `${tx.to}`, sender: `${tx.from}`,
        }
        const response = yield call(post, 'payment', body)
        if (response === undefined) {
            return yield put(Actions.paymentFailed(tx.set('rejected', true),
            Error("Server failure!")))
        }
        if (response.amount_transferred !== tx.amount) {
            throw Error(`Server sent  a different amount than we requested!
It sent ${response.amount_transferred}, but we requested ${tx.amount} in ${tx}`)
        }
        const serverFrom = new Address(response.sender_account.address)
        if (!tx.from.equals(serverFrom)) {
            throw Error(`Server registered tx to different sender!
It has the sender as ${serverFrom}, but we had it as ${tx.from}.`)
        }
        const serverTo = new Address(response.recipient_account.address)
        if (!tx.to.equals(serverTo)) {
            throw Error(`Server registered tx to different sender!
It has the sender as ${serverTo}, but we had it as ${tx.to}.`)
        }
        const fromBalance = response.sender_account.balance
        const toBalance = response.recipient_account.balance
        // XXX: Track side_chain_tx_revision in the client??
        yield put(Actions.paymentValidated(
            tx.set('validated', true), fromBalance, toBalance))
    }
    catch (e) {
        throw e
        return yield put(Actions.paymentFailed(tx.set('rejected', true), e))
    }
}

export const paymentListener = listener(Actions.Action.PAYMENT_INITIATED, payment)
