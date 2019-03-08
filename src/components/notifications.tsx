import * as React from 'react';
import {connect} from 'react-redux'
import {Icon, Message} from "semantic-ui-react";
import {createRemoveNotificationAction} from "../types/actions";
import INotification, {NotificationLevel} from "../types/notification";
import {UIState} from '../types/state';

const getIconName = (level: NotificationLevel) => {
    switch (level) {
        case 'error':
            return 'warning';
        case 'warning':
            return 'warning';
        case 'info':
            return 'info';
        default:
            return 'info';
    }
};

const createNotificationElement = (n: INotification, k: number, dispatch: (a: any) => any) => {
    const closeCall = () => dispatch(createRemoveNotificationAction(n.guid));
    return <Message
        key={k}
        warning={n.level === 'warning'}
        error={n.level === 'error'}
        info={n.level === 'info'}
        style={{width: '70%'}}
    >
        <Icon name={'close'} onClick={closeCall} />
        <Icon name={getIconName(n.level)} />{n.text}
    </Message>;
};

/** A row corresponding to a tx. */
export const DumbNotifications = ({ notifications, dispatch }: { notifications: INotification[], dispatch: (p: any) => any }) => {
    const notificationElements = notifications.map((n: INotification, k: number) => createNotificationElement(n,k, dispatch));

    return (<div className={'snackbar'}>{notificationElements}</div>);
};

export const Notifications = connect(
    (state: UIState) => ({notifications: state.notifications.toArray()}),
    (dispatch: (p: any) => any) => ({dispatch})
    )(DumbNotifications);

