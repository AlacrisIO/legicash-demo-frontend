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

import { delay }     from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import {
    get, IThreadResponse, post, readThread, resultPending
} from '../server/common'

import * as Actions             from '../types/actions'
import { Address }              from '../types/address'
import { Guid }                 from '../types/guid'
import { emptyHash, HashValue } from '../types/hash'
import { Transaction }          from '../types/tx'
import { Money }                from "../types/units";
import { listener }             from './common'

/** Hit server with given args, and report deposit failure on exception */
const serverWithErrorHandling = ( address: Address
                                , tx:      Transaction
                                , failure: Actions.crossChainFailureMessage
                                ) =>
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
    const threadNumber = readThread(threadResponse)
    let delayTimeMS = 1  // Initial delay time before checking
    let threadCheck

    while (true) {
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
    failure: Actions.crossChainFailureMessage,
    /** Computes transaction source revision number given server response */
    srcRev: revisionNumber,
    /** Computes transaction destination revision number given server response */
    dstRev: revisionNumber
) =>
    function* (action: Actions.ICrossChainInitiate) {

        const failMsg = (msg: string) => failure(action.tx.from, action.tx, Error(msg));
        const address = action.tx.from.toString()
        const amount  = '0x' + action.tx.amount.toWei(16)
        const server  = serverWithErrorHandling(action.tx.from, action.tx, failure)

        // TODO: this smells wrong but right now `localGUID` is allowed to be
        // `undefined` based on its signature, so even if it shouldn't be
        // possible to reach this phase without a GUID, we have to satisfy the
        // type system by transparently generating a new one if it's not
        // provided - verify and/or fix
        // tslint:disable:variable-name
        const request_guid = (action.tx.localGUID || new Guid()).toString()

        const threadResponse = yield* server(post, endpoint, { address, amount, request_guid })

        if (!threadResponse) {
            // throw Error("Server returned null/undefined value!");
            return yield put(failMsg("Server returned null/undefined value!"));
        }

        if (threadResponse.error) {
            yield put(Actions.createAddNotificationAction(
                'threadResponse.error',
                'error',
                5000
            ));
            return yield put(failMsg(endpoint + ' Action failed'));
            // return yield put(failMsg(threadResponse.error));
        }

        try {
            const result: ICrossChainServerResponse | IThreadResponse = yield* awaitThread(server, threadResponse);

            if ((result as IThreadResponse).error) {
                yield put(Actions.createAddNotificationAction(
                    `The ${endpoint} action failed`,
                    'error',
                    5000
                ));
                // tslint:disable:no-console
                console.warn(`Error in operation ${endpoint}`);
                // tslint:disable:no-console
                console.warn((result as IThreadResponse).error);
                return yield put(failMsg((result as IThreadResponse).error));
            }

            if (resultPending(result as IThreadResponse)) {
                yield put(Actions.createAddNotificationAction(
                    "Thread Timed out!",
                    'error',
                    5000
                ));
                return yield put(failMsg("Timed out!"));
            }

            if ((result as ICrossChainServerResponse).main_chain_confirmation === undefined) {
                yield put(Actions.createAddNotificationAction(
                    "Server Failure",
                    'error',
                    5000
                ));
                return put(failMsg(`Server failure! Response: ${JSON.stringify(result)}`));
            }

            const response = result as ICrossChainServerResponse;
            // Update the transaction with the new information

            const hash = (response.main_chain_confirmation as any).transaction_hash;
            const newTx = action.tx.multiUpdateIn([
                [['validated'], () => true],
                [['hash'], updateHash(hash)],
                [['srcSideChainRevision'], srcRev(response)],
                [['dstSideChainRevision'], dstRev(response)],
            ]);

            const side_chain_account_state = response.side_chain_account_state;
            const balance = new Money(side_chain_account_state.balance, 16, 'wei');
            yield put(success(action.tx.from, balance, action.tx, newTx));
        } catch(e) {
            yield put(Actions.createAddNotificationAction(
                'Thread Failed' + e,
                'error',
                5000
            ));
        }
    };

const parseSideChain = (r: ICrossChainServerResponse) =>
    (_: number | undefined) => parseInt(r.side_chain_tx_revision, 16)

const dummyMainChain = (r: ICrossChainServerResponse) =>
    (_: number | undefined) => undefined

/** Generator for deposit server interaction */
export const makeDeposit = crossChainTx(
      'deposit'
    , Actions.depositValidated
    , Actions.depositFailed
    , dummyMainChain
    , parseSideChain);

export const depositListener = listener(Actions.Action.MAKE_DEPOSIT, makeDeposit)

export const makeWithdrawal = crossChainTx(
      'withdrawal'
    , Actions.withdrawalValidated
    , Actions.withdrawalFailed
    , parseSideChain
    , dummyMainChain)

export const withdrawalListener = listener(Actions.Action.MAKE_WITHDRAWAL, makeWithdrawal)
