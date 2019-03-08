import {Guid} from "../guid";
import {NotificationLevel} from "../notification";
import {Action, IActionType} from "./base_actions";

export interface INotifAdd extends IActionType {
    guid: Guid;
    text: string;
    level: NotificationLevel;
    timeout: number;
}

export interface INotifRemove extends IActionType {
    guid: Guid;
}

export const createAddNotificationAction = (
    text: string,
    level: NotificationLevel = 'info',
    timeout: number = 0
) => ({
        guid: new Guid(),
        level,
        text,
        timeout,
        type: Action.ADD_NOTIFICATION
    } as INotifAdd);

export const createRemoveNotificationAction = (guid: Guid) => ({
    guid, type: Action.REMOVE_NOTIFICATION
} as INotifRemove);
