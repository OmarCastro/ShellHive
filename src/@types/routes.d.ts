declare interface subscribeGraphRequest {
    id: string
}

interface CsrfRequest {
         _csrf? :string
}

interface subscribeProjectResponse {
    success: boolean,
    message: string,
    clients: any[],
    visitor: any[],
    you: any,
    implementedCommands: any[],
    SelectionOptions: any[],
    graphs: dbmodels.IGraph[]
}


interface subscribeGraphResponse {
    graph: dbmodels.IGraph,
}

interface setUserName extends CsrfRequest {
    name: string,
    color?: string,
}

interface UserConfigRequest extends CsrfRequest {
    name: string,
    color?: string,
}

interface ChatMessage extends CsrfRequest {
    data: string
}

interface ICreateComponentParams extends CsrfRequest {
    command: string
    position: IPoint
}