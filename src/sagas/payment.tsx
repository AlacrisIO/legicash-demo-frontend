import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { get, post, readThread, resultPending } from '../server/common'
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
        const threadResponse = yield call(post, 'payment', body)
        // XXX: Copy-pasta from cross_chain.crossChainTx. Factor out
        if (!threadResponse) { throw Error("Server returned null/undefined value!") }
        const failMsg = (msg: string) =>
            put(Actions.paymentFailed(tx.set('rejected', true),
                Error("Server failure!")))
        if (threadResponse.error) { return yield failMsg(threadResponse.error) }
        const threadNumber = readThread(threadResponse as { result: string })
        let delayTimeMS = 1  // Initial delay time before checking
        let threadCheck
        for (let checkIdx: number = 0; checkIdx < 12; checkIdx++) {  // Wait ~8s
            yield call(delay, delayTimeMS)
            delayTimeMS *= 2  // Exponential backoff after each failed try
            try {
                threadCheck = yield call(get, 'thread', { id: threadNumber })
            } catch (e) {
                threadCheck = e
                yield failMsg(`${e}`)
            }
            if (!resultPending(threadCheck)) { break }
        }
        const response = threadCheck;
        if (response === undefined) {
            return yield failMsg("Server failure!")
        }
        const srcSideChainRevision = parseHexAsNumber(response.side_chain_tx_revision)
        const dstSideChainRevision = srcSideChainRevision
        const finalTx = tx.set('validated', true)
            .set('srcSideChainRevision', srcSideChainRevision)
            .set('dstSideChainRevision', dstSideChainRevision)
        yield put(Actions.paymentValidated(finalTx))
    }
    catch (e) {
        throw e
        return yield put(Actions.paymentFailed(tx.set('rejected', true), e))
    }
}

export const paymentListener = listener(Actions.Action.PAYMENT_INITIATED, payment)
