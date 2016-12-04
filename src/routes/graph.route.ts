import { Graph } from "../graph"

 export interface subscribeProjectResponse {
      success: boolean,
      message: string,
      clients: any[],
      visitor: any[],
      you: any,
      implementedCommands: any[],
      SelectionOptions: any[],
      graphs: any[]
    }


    export interface subscribeGraphResponse {
      graph: Graph,
    }

    export interface subscribeGraphRequest {
      id: string
    }

    export interface CsrfRequest {
         _csrf? :string
    }

    export interface setUserName extends CsrfRequest{
          name:string, 
          color?: string,
    }
export interface requestParams<T,V> {
    url: string,
    type: "get" | "post" | "put" | "delete"
    data: T,
    onSuccess:  (data: V) => any,
}


export abstract class Router {
    get(url:'/graph/subscribe/', data:subscribeGraphRequest, onSuccess: (data: subscribeGraphResponse) => any)
    get(url: '/project/subscribe', data: subscribeGraphRequest, onSuccess: (data: subscribeProjectResponse) => any);
    get<T, V>(url: string, data: T, onSuccess?: (data: V) => any){
        this.request({url,type: "get",data,onSuccess})
    };
    post(url:'/project/setmyname', data:setUserName)
    post<T extends CsrfRequest, V>(url: string, data: T, onSuccess?: (data: V) => any){
        this.request({url,type: "post",data,onSuccess})
    };
    abstract request<T,V>(params: requestParams<T,V>)
}