import { takeEvery } from 'redux-saga'
import * as Actions from '../types/actions'

/**
 * The last yield seems to get dropped by redux saga, so throw an extra on the
 * end. XXX: Figure out why it's being dropped!
 */
const addDummyReturnValue = (g: any) => function* (action: Actions.IActionType) {
    yield* g(action);
    yield undefined
}

/** Return a generator which kicks off given generator on given action  */
export const listener = (actionType: Actions.Action, generator: any) =>
    function* () {
        const actionMatcher = (action: Actions.IActionType) =>
            action.type === actionType
        yield takeEvery(actionMatcher, addDummyReturnValue(generator))
    }

