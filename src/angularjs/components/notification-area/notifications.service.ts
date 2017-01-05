
interface BaseNotification {
    type?: "info" | "danger";
    msg: string
}

export interface InfoNotification extends BaseNotification {
  type: "info";
}

export interface Alert {
  type: "danger";
}

export interface ProgressNotification extends BaseNotification {
  type: "info";
  progress: number
}

class NotificationCloseTimeout{
    private timer;
    private doneCallback = [] as Function[];
    constructor(
        callback: Function,
        timeout: number
    ){
        this.timer = setTimeout(() => {callback(); this.doneCallback.forEach(_ => _())}, timeout)
    }

    stop(){ clearTimeout(this.timer) }
    then( callback: Function){ this.doneCallback.push(callback); }


}

export type Notification = InfoNotification | Alert | ProgressNotification

export class NotificationService{
    readonly notifications = [] as Notification[];

    pushNotification(notification: Notification){
        this.notifications.push(notification);
    }

    closeNotification(notification: Notification){
       this.notifications.splice(this.notifications.indexOf(notification), 1);
    }

    closeNotificationOnTimeout(notification: Notification, timeoutInMillis: number){
        return new NotificationCloseTimeout(() => this.closeNotification(notification), timeoutInMillis);
    }
}

export default new NotificationService();
