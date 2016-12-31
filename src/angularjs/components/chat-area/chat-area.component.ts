import * as app from "../../app.module"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import { GraphController, GraphControllerScope } from "../graph/graph.controller"
import network, {routeTable} from "../../router"
import { CSRF } from "../../services/csrf"

class ChatAreaController {
    public chatMsg = ""

    public sendChat(){
        network.send({
            payload:  { data: this.chatMsg } ,
            useRoute: routeTable.chat()
        }).onResponse((data) => {
            console.log("receive message:"+data)
        })

        this.chatMsg = "";
    }
}

app.component("chat", {
    controller: ChatAreaController,
    controllerAs: "ctrl",
    template: require("./chat-area.html"),
    bindings: {
        clients: '=',
        chatMessages: '='
    }
})