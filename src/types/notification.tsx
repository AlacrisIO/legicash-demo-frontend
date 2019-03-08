import {Guid} from "./guid";

export type NotificationLevel = "error" | "warning" | "info";

export default interface INotification {
    guid: Guid;
    text: string;
    level: NotificationLevel;
    timeout: number|null;
}
