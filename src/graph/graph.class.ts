import { Component } from "./component/component";
import { Connection } from "./connection.class";


export class Graph{
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
  public containsComponent(component:Component){
    for(var i = 0, _ref=this.components, length=_ref.length;i<length;++i){
      if( _ref[i] == component){ return true }
    }
    return false;
  }

  /**
    removes the component of the graph and returns the connections related to it
  */
  public removeComponent(component:Component):Connection[]{
    if(this.containsComponent(component)){
      if(component == this.firstMainComponent){
        this.firstMainComponent = null;
      }
      var returnlist:Connection[] = [];
      var filteredlist:Connection[] = [];
      for(var i = 0, _ref=this.connections, length=_ref.length;i<length;++i){
        var connection = _ref[i];
        if(connection.startComponent == component || connection.endComponent == component){
          returnlist.push(connection);
        } else {
          filteredlist.push(connection);          
        }
      }

      this.components.splice(this.components.indexOf(component),1);
      this.connections = filteredlist;
      return returnlist;
    }
    return null;
  }

  public connect(startComponent:Component, outputPort:string, endComponent:Component, inputPort:string){
    var connection = new Connection(startComponent,outputPort,endComponent,inputPort)
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