import { Component } from "./component/component";

/**
	Represents a connection between 2 components
*/
export class Connection{
	public constructor(
		public startComponent:Component,
		public startPort:string,
		public endComponent:Component,
		public endPort:string
		){}

  public get startNode():number{return this.startComponent.id;}
  public get endNode():number{return this.endComponent.id;}

	public toJSON(){
		return {
			startNode: this.startNode,
			startPort: this.startPort,
			endNode: this.endComponent.id,
			endPort: this.endPort
		}
	}

}