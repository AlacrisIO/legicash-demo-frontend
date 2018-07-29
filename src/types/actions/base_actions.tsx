/** Base interface for actions which require a server response. */

import { ServerResponse } from './server'

export enum Action {

    /* Actions related to waiting on a server thread */
    THREAD_RESPONSE,  // Server gives back a thread num
    CHECK_THREAD,  // Check thread for completion

    /* Actions related to making a deposit. */
    ADD_ADDRESS, // Add this address to the app
    MAKE_DEPOSIT, // Deposit to this address on side chain
    DEPOSIT_VALIDATED, // Deposit has been added
    DEPOSIT_FAILED, // Deposit was not added

}

/** Characteristics of all action types */
export interface IActionType {
    /** Used to switch off on the actions */
    readonly type: Action
}

/** Actions which require a server response */
export interface IServerResponse {
    readonly serverResponse: ServerResponse /* XXX: */
}
