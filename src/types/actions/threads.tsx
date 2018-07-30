import { Action, IActionType, IServerResponse } from './base_actions'

/** Base type for thread actions */
export interface IThreadType extends IActionType {
    /** ID number for the server thread, so we can check back for completion */
    readonly threadNumber: number;
    /** What to do with the result */
    readonly nextAction: IServerResponse
}

/** Response that a thread has been kicked off on the server. */
export interface IThreadResponse extends IThreadType {
    readonly type: Action.THREAD_RESPONSE;
}

export const threadResponse =
    (threadNumber: number, nextAction: IServerResponse): IThreadResponse => (
        { type: Action.THREAD_RESPONSE, threadNumber, nextAction })

/** Sent when it's time to check a thread again. */
export interface ICheckThread extends IThreadType {
    readonly type: Action.CHECK_THREAD
}

export const checkThread =
    (threadNumber: number, nextAction: IServerResponse): ICheckThread => (
        { type: Action.CHECK_THREAD, threadNumber, nextAction })

