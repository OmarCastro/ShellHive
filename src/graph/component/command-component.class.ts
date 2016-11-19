import { Component } from "./component.class"

/**
   CommandComponent is responsible to provide information to create a view representing a command 
*/
export class CommandComponent extends Component{
    public static type:string = "command"
    public type:string = CommandComponent.type
    public flags:any
    public selectors:any
    public parameters:any
    public exec:string = null
    public files:any[]
}