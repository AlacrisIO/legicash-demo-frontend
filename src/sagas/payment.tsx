import {delay} from 'redux-saga'
import {call, put} from 'redux-saga/effects'
import {get, IThreadResponse, post, readThread, resultPending} from '../server/common'
import * as Actions from '../types/actions'
import {Guid} from '../types/guid'
import {listener} from './common'

const parseHexAsNumber = (s: string) => parseInt(s, 16)

export function* payment(action: Actions.IPaymentInitiated) {
    const tx = action.tx;

    try {

        // TODO: this smells wrong but right now `localGUID` is allowed to be
        // `undefined` based on its signature, so even if it shouldn't be
        // possible to reach this phase without a GUID, we have to satisfy the
        // type system by transparently generating a new one if it's not
        // provided - verify and/or fix
        // tslint:disable:variable-name
        const request_guid = (action.tx.localGUID || new Guid()).toString()

        const body = { amount:      tx.amount.toPrefixedHexWei()
                     , recipient:   `${tx.to}`
                     , request_guid
                     , sender:      `${tx.from}`
                     }

        const threadResponse = yield call(post, 'payment', body)

        // XXX: Copy-pasta from cross_chain.crossChainTx. Factor out
        if (!threadResponse) {
            throw Error("Server returned null/undefined value!")
        }

        const failMsg = (msg: string) =>
            put(Actions.paymentFailed(tx.set('rejected', true)
                                    , Error("Server failure!")
                                    , action.address));

        if (threadResponse.error) {
            return yield failMsg(threadResponse.error)
        }

        const threadNumber = readThread(threadResponse as { result: string , error?: any})
        let delayTimeMS    = 1  // Initial delay time before checking
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

        if ((threadCheck as IThreadResponse).error) {
            yield put(Actions.createAddNotificationAction(
                `The payment action failed`,
                'error',
                5000
            ));

            return yield failMsg((threadCheck as IThreadResponse).error);
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

        yield put(Actions.paymentValidated(finalTx, action.address))

    } catch (e) {
        return yield put(Actions.paymentFailed(tx.set('rejected', true)
                                             , e
                                             , action.address))
    }
}

export const paymentListener = listener(Actions.Action.PAYMENT_INITIATED, payment)
