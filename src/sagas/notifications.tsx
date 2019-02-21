import {delay} from "redux-saga";
import {put, takeEvery} from "redux-saga/effects";
import * as Actions from "../types/actions";
import {INotifAdd} from "../types/actions";

const handleNotification = function* (a: INotifAdd) {
    if (a.timeout) {
        yield delay(a.timeout);
        yield put(Actions.createRemoveNotificationAction(a.guid));
    }
};

export const notificationsListener = function* () {
    const addNotificationMatcher =  (ac: Actions.IActionType) => ac.type === Actions.Action.ADD_NOTIFICATION;
    yield takeEvery(addNotificationMatcher, handleNotification);
};
