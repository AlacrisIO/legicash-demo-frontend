import { call, put } from 'redux-saga/effects'
import { post } from '../server/common'
import * as Actions from '../types/actions'
import { listener } from './common'

const parseHexAsNumber = (s: string) => parseInt(s, 16)

export function* payment(action: Actions.IPaymentInitiated) {
    const tx = action.tx
    try {
        const body = {
            amount: '0x' + (tx.amount as number).toString(16),
            recipient: `${tx.to}`, sender: `${tx.from}`,
        }
        const response = yield call(post, 'payment', body)
        if (response === undefined) {
            return yield put(Actions.paymentFailed(tx.set('rejected', true),
                Error("Server failure!")))
        }
        if (response.amount_transferred === undefined) {
            return yield put(
                Actions.paymentFailed(tx.set('rejected', true),
                    Error(`Unexpected server response!
${JSON.stringify(response)}`)))
        }
        if (response.amount_transferred !== '0x' + (tx.amount as number).toString(16)) {
            throw Error(`Server sent  a different amount than we requested!
It sent ${response.amount_transferred}, but we requested ${tx.amount} in ${tx}`)
        }
        const fromBalance = response.sender_account.balance
        const toBalance = response.recipient_account.balance
        const srcSideChainRevision = parseHexAsNumber(response.side_chain_tx_revision)
        const dstSideChainRevision = srcSideChainRevision
        const finalTx = tx.set('validated', true)
            .set('srcSideChainRevision', srcSideChainRevision)
            .set('dstSideChainRevision', dstSideChainRevision)
        yield put(Actions.paymentValidated(finalTx, fromBalance, toBalance))
    }
    catch (e) {
        throw e
        return yield put(Actions.paymentFailed(tx.set('rejected', true), e))
    }
}

export const paymentListener = listener(Actions.Action.PAYMENT_INITIATED, payment)
