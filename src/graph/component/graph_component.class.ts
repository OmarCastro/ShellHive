import { Component } from "./component.class"
import { Graph } from "../graph.class"

/**
	A macro Component
*/
export class GraphComponent extends Component{
    public static type:string = "graph"
    public type:string = GraphComponent.type

    public entryComponent:Component = null
    public exitComponent:Component = null
    public counter: number = 0
    public components:any[] = []
    public connections:any[] = []

    constructor(
      public name:string,
      public description:string
    ){super();}

    public setGraphData(graphData:Graph){
        this.components = graphData.components
        this.connections = graphData.connections
        this.entryComponent = graphData.firstMainComponent
    }
}