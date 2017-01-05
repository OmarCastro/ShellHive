import * as app from "../../app.module"
import notificationService from "./notifications.service"

class ChatAreaController {
    public chatMsg = ""

    get notifications(){
        return notificationService.notifications;
    }

    closeNotification(index: number){
        notificationService.notifications.splice(index, 1)
    }
}

app.component("notification-area", {
    controller: ChatAreaController,
    controllerAs: "ctrl",
    template: require("./notification-area.html"),
})