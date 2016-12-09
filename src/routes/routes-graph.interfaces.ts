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