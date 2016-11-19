import { Component } from "./component"
import { Graph } from "./graph.class"

export class IndexedGraph{
	public components:{[s:number]:Component} = {}
	public inputConnections:any  = {}
	public outputConnections:any = {}

	public constructor(graph:Graph){
		var components = this.components
		var outputConnections = this.outputConnections
		var inputConnections = this.inputConnections
		
		graph.components.forEach(component => {
			components[component.id] = component
		});
		graph.connections.forEach(connection => {
			outputConnections[connection.startNode] = connection
			inputConnections[connection.endNode] = connection
		});
	}
}
