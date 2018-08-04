import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import {
    get, IThreadResponse, post, readThread, resultPending
} from '../server/common'
import * as Actions from '../types/actions'
import { depositFailed } from '../types/actions';
import { Address } from '../types/address'
import { emptyHash, HashValue } from '../types/hash'
import { Transaction } from '../types/tx'

/** Hit server with given args, and report deposit failure on exception */
const serverWithErrorHandling = (address: Address, tx: Transaction) =>
    function* (...args: any[]) {
        try { return yield (call as any)(...args) } catch (e) {
            yield put(Actions.depositFailed(address, tx, e))
        }
    }

/* See https://gitlab.com/legicash/legicash-facts/blob/endpoints-demo/src/endpoints/endpoints.md#depositwithdrawal-threads */
function* awaitThread(server: any, threadResponse: IThreadResponse) {
    const threadNumber = readThread(threadResponse as { result: string })
    let delayTimeMS = 1  // Initial delay time before checking
    let threadCheck
    for (let checkIdx: number = 0; checkIdx < 12; checkIdx++) {  // Wait ~8s
        yield call(delay, delayTimeMS)
        delayTimeMS *= 2  // Exponential backoff after each failed try
        threadCheck = yield* server(get, 'thread', { id: threadNumber })
        if (!resultPending(threadCheck)) { break }
    }
    return threadCheck
}

const updateHash = (rawHash: string) => {
    const newHash = new HashValue(rawHash)
    return (oldH: HashValue): HashValue => {
        if (oldH && (!oldH.equals(emptyHash)) && (!oldH.equals(newHash))) {
            throw Error(`Conflicting hashes! ${oldH} vs ${newHash}`)
        }
        return newHash
    }
}

export function* makeDeposit(action: Actions.IMakeDeposit) {
    const address = action.address.toString()
    const amount = action.tx.amount
    const server = serverWithErrorHandling(action.address, action.tx)
    const threadResponse = yield* server(post, 'deposit', { address, amount })
    const result: any = yield* awaitThread(server, threadResponse)
    if (resultPending(result)) {
        return depositFailed(action.address, action.tx, Error("Timed out!"))
    }
    // Update the transaction with the new information
    const newTx = action.tx.multiUpdateIn([
        [['validated'], () => true],
        [['hash'], updateHash(result.main_chain_confirmation.transaction_hash)],
    ])
    return Actions.depositValidated(
        action.address, result.user_account_state.balance, action.tx, newTx)
}
