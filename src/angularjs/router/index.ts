
import { requestParams, CsrfRequest, Router as BaseRouter } from "../../routes/graph.route"
import {SocketService} from "../socket.service"
import {CSRF} from "../services/csrf"

class Router extends BaseRouter {
    request<T,V>(params: requestParams<T,V>){

        switch(params.type){
            case "get" : return SocketService.sailsSocket.get(params.url,params.data,params.onSuccess)
            case "post": {
                const data = (params.data as CsrfRequest)
                data._csrf = data._csrf || CSRF.csrfToken
                return SocketService.sailsSocket.post(params.url,data,params.onSuccess)
            }
        }
    }

    
}

export default new Router()
