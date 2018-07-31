import { Action, IActionType } from './base_actions'
import { ServerResponse } from './server'

/** Base type for thread actions */
export interface IThreadType extends IActionType {
    /** ID number for the server thread, so we can check back for completion */
    readonly threadNumber: number;
    /** Expected result from thread */
    readonly expectedResponse: ServerResponse
    /** What to do with the result */
}

/** Response that a thread has been kicked off on the server. */
export interface IThreadResponse extends IThreadType {
    readonly type: Action.THREAD_RESPONSE;
}

export const threadResponse =
    (threadNumber: number, expectedResponse: ServerResponse, nextAction: Action): IThreadResponse => (
        { type: Action.THREAD_RESPONSE, threadNumber, expectedResponse })

/** Sent when it's time to check a thread again. */
export interface ICheckThread extends IThreadType {
    readonly type: Action.CHECK_THREAD
}

export const checkThread =
    (threadNumber: number, expectedResponse: ServerResponse, nextAction: ServerResponse): ICheckThread => (
        { type: Action.CHECK_THREAD, threadNumber, expectedResponse })

