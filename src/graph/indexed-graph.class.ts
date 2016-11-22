import { Component } from "./component"
import { Graph } from "./graph.class"

export class IndexedGraph{
	public components:{[s:number]:Component} = {}
	public inputConnections:any  = {}
	public outputConnections:any = {}

	public constructor(graph:Graph){
		const components = this.components
		const outputConnections = this.outputConnections
		const inputConnections = this.inputConnections
		
		graph.components.forEach(component => {
			components[component.id] = component
		});
		graph.connections.forEach(connection => {
			outputConnections[connection.startNode] = connection
			inputConnections[connection.endNode] = connection
		});
	}
}
