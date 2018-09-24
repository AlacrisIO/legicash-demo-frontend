/**
 * Logic for transactions with the main chain (deposits / withdrawals)
 *
 * Basic pattern is that `crossChainTx` generator initiates the transaction,
 * then hands off to `awaitThread`, which polls the server with exponential 
 * backoff until the server returns the actual result.
 *
 * To wire this into the redux machinery, `crossChainListener` creates another
 * generator which checks every message for a relevant event, and hands off to
 * a crossChainTx generator when it finds one. Then that generator is 
 * referenced in `rootSaga`, which  is started in ../App.tsx with
 * `sagaMiddleware.run`.
 */

import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import {
    get, IThreadResponse, post, readThread, resultPending
} from '../server/common'
import * as Actions from '../types/actions'
import { Address } from '../types/address'
import { emptyHash, HashValue } from '../types/hash'
import { Transaction } from '../types/tx'
import { listener } from './common'

/** Hit server with given args, and report deposit failure on exception */
const serverWithErrorHandling = (address: Address, tx: Transaction,
    failure: Actions.crossChainFailureMessage) =>
    function* (...args: any[]) {
        try {
            return yield (call as any)(...args)
        } catch (e) {
            yield put(failure(address, tx, e))
            return e
        }
    }

/* See
 * https://gitlab.com/legicash/legicash-facts/blob/endpoints-demo/src/endpoints/endpoints.md#depositwithdrawal-threads */
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

type hex_string = string /** 0x-prefix hex string */

interface ICrossChainServerResponse {
    side_chain_account_state: { balance: hex_string, account_revision: hex_string },
    side_chain_tx_revision: hex_string,
    main_chain_confirmation: hex_string /* XXX: FIX!!! */
}

/** Update logic for a transaction revision number. */
type revisionNumber = ((r: ICrossChainServerResponse) =>
    ((_: number | undefined) => number | undefined))

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
        const server = serverWithErrorHandling(action.tx.from, action.tx, failure)
        const threadResponse = yield* server(post, endpoint, { address, amount })
        const result: any = yield* awaitThread(server, threadResponse)
        const failMsg = (msg: string) =>
            failure(action.tx.from, action.tx, Error(msg))
        if (resultPending(result)) { return yield failMsg("Timed out!") }
        if (result === undefined) { return yield failMsg("Server failure!") }
        // Update the transaction with the new information
        const hash = result.main_chain_confirmation.transaction_hash
        const newTx = action.tx.multiUpdateIn([
            [['validated'], () => true],
            [['hash'], updateHash(hash)],
        ])
        yield put(success(
            action.tx.from, result.user_account_state.balance, action.tx, newTx))
    }

/** Generator for deposit server interaction */
export const makeDeposit = crossChainTx('deposit', Actions.depositValidated,
    Actions.depositFailed)

export const depositListener = listener(Actions.Action.MAKE_DEPOSIT, makeDeposit)

export const makeWithdrawal = crossChainTx(
    'withdrawal', Actions.withdrawalValidated, Actions.withdrawalFailed)

export const withdrawalListener = listener(
    Actions.Action.MAKE_WITHDRAWAL, makeWithdrawal)
