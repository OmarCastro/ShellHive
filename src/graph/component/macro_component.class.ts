import { Component } from "./component.class"
import { Macro } from "../macro.class"

/**
  A macro Component
*/
export class MacroComponent extends Component{
    public static type:string = "macro"
    public type:string = MacroComponent.type

    constructor(
      public macro:Macro
    ){super();}

}