import {subscribeProjectResponse, subscribeGraphResponse, subscribeGraphRequest} from "./graph.route"


    export interface CsrfRequest {
         _csrf? :string
    }

    export interface UserConfigRequest extends CsrfRequest{
          name:string, 
          color?: string,
    }
export interface requestParams<T,V> {
    url: string,
    type: "get" | "post" | "put" | "delete"
    data: T,
    onSuccess?:  (data: V) => any,
}

class BaseRoute{
    
    public constructor(
        protected router: Router,
        protected type: "get" | "post" | "put" | "delete",
        private _url: string,
        protected data: Object  
    ){}

    get url(){ return this._url }
      
}

export class SignalEmitter extends BaseRoute{
    
    get request(){
        return this.router.request({url: this.url, type: this.type, data:this.data})
    }   
}



export class Route<ResponseType> extends BaseRoute{
    request(onSuccess: (response: ResponseType) => any ){
        this.router.request({url: this.url, type: this.type, data:this.data, onSuccess})
    }   
}

interface callableRoute<ResponseType> extends Route<ResponseType>{
    (): Route<ResponseType>
}

interface callableSignal extends SignalEmitter{
    (): SignalEmitter
}




export abstract class Router {
    
    subscribeGraph = (graph: subscribeGraphRequest)   => this.get<subscribeGraphResponse>('/graph/subscribe/', graph);
    subscribeProject = (graph: subscribeGraphRequest) => this.get<subscribeProjectResponse>('/project/subscribe', graph);
    directoriesOfProject = (projectId: string) => this.get<any[]>("/directories/project/"+projectId, null);
    uploadToProject = (projectId: string) => this.sget("/upload/"+projectId, null);
    setUserName = (user: UserConfigRequest) => this.spost('/project/setmyname', user)


    abstract request<T,V>(params: requestParams<T,V>)
    private get<T>(url: string, data: Object){return  new Route<T>(this,"get",url, data)}
    private sget(url: string, data: Object){return  new SignalEmitter(this,"get",url, data)}
    private spost(url: string, data: Object){return  new SignalEmitter(this,"get",url, data)}
    protected callable<T>(router: Route<T>): callableRoute<T>
    protected callable<T>(signal: SignalEmitter): callableSignal
    protected callable<T>(router: Route<T>|SignalEmitter){
        const route = function(){return router;}
        Object.defineProperty(route, "request", { get: () => router.request });
        Object.defineProperty(route, "url", { get: () => router.url });
    return route
}

}