
import { requestParams, CsrfRequest, Router as BaseRouter, Route } from "../../routes/router"
import {SocketService} from "../socket.service"
import {CSRF} from "../services/csrf"
import { projectId } from "../utils"

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

    get directoriesOfCurrentProject(){return this.callable(this.directoriesOfProject(projectId));}
    get uploadToCurrentProject(){return this.callable(this.uploadToProject(projectId));}


    
}

export default new Router()
