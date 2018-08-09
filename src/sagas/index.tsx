import { delay, takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import {
    get, IThreadResponse, post, readThread, resultPending
} from '../server/common'
import * as Actions from '../types/actions'
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

/** Return a generator for a cross-chain server interaction */
const crossChainTx = (
    /** The endpoint to hit on the server */
    endpoint: string,
    /** Constructor for  message to send on success */
    success: Actions.crossChainValidationMessage,
    /** Constructor for message to send on failure. */
    failure: Actions.crossChainFailureMessage) =>
    function* (action: Actions.ICrossChainInitiate) {
        const address = action.tx.from.toString()
        const amount = action.tx.amount
        const server = serverWithErrorHandling(action.tx.from, action.tx)
        const threadResponse = yield* server(post, endpoint, { address, amount })
        const result: any = yield* awaitThread(server, threadResponse)
        if (resultPending(result)) {
            yield put(failure(action.tx.from, action.tx, Error("Timed out!")))
            yield undefined  // Otherwise the above event is dropped??
        }
        // Update the transaction with the new information
        /* tslint:disable:no-console */
        console.log('does this work, now?', result.toString())
        const hash = result.main_chain_confirmation.transaction_hash
        const newTx = action.tx.multiUpdateIn([
            [['validated'], () => true],
            [['hash'], updateHash(hash)],
        ])
        yield put(success(
            action.tx.from, result.user_account_state.balance, action.tx, newTx))
        return undefined  // Otherwise the above event is dropped??
    }

/** Return a generator which kicks off given generator on given action  */
const crossChainListener = (actionType: Actions.Action, generator: any) =>
    function* () {
        const actionMatcher = (action: Actions.IActionType) =>
            action.type === actionType
        yield takeEvery(actionMatcher, generator)
    }

/** Generator for deposit server interaction */
export const makeDeposit = crossChainTx('deposit', Actions.depositValidated,
    Actions.depositFailed)

export const depositListener = crossChainListener(
    Actions.Action.MAKE_DEPOSIT, makeDeposit)

export const makeWithdrawal = crossChainTx(
    'withdrawal', Actions.withdrawalValidated, Actions.withdrawalFailed)

export const withdrawalListener = crossChainListener(
    Actions.Action.MAKE_WITHDRAWAL, makeWithdrawal)
