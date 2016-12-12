import { Component } from "./component";
import { Connection } from "./connection.class";


export class Graph implements graph.IGraph{
	public constructor(
	public components:Component[] = [],
	public connections:Connection[] = [],
	public firstMainComponent:Component = null,
  public counter:number = 0
	){}
	/**
		transforms to JSON, JSON.stringify() will 
		call this function if it exists
	*/
	public toJSON(){
		return {
      components: this.components,
      connections: this.connections,
    }
	}

  /**
    in graph
  */
  public containsComponent(target:Component){
    return this.components.some(component => component == target)
  }

  /*
    removes the component of the graph and returns the connections related to it
  */
  public removeComponent(component:Component):Connection[]{
    if(this.containsComponent(component)){
      if(component == this.firstMainComponent){
        this.firstMainComponent = null;
      }
      const returnlist:Connection[] = [];
      const filteredlist:Connection[] = [];
      this.connections.forEach((connection) => {
        if(connection.startComponent == component || connection.endComponent == component){
          returnlist.push(connection);
        } else {
          filteredlist.push(connection);          
        }
      });
      this.components.splice(this.components.indexOf(component),1);
      this.connections = filteredlist;
      return returnlist;
    }
    return null;
  }

  public connect(startComponent:Component, outputPort:string, endComponent:Component, inputPort:string){
    const connection = new Connection(startComponent,outputPort,endComponent,inputPort)
    this.connections.push(connection);
  }

	/*
		expands with other graph
	*/
	public expand(other:Graph){
		this.concatComponents(other.components)
		this.concatConnections(other.connections)
    //if(this.counter){
    //  other.components.forEach(component => {
    //    component.id = this.counter++;
    //  });
    //}
	}

	public concatComponents(components){ this.components = this.components.concat(components) }
  public concatConnections(connections){this.connections =  this.connections.concat(connections) }
}