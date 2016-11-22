import { Graph } from "./graph.class"

/**
  A macro is responsible to make a represntation of a component that is a wrapper
  of a sequence of commands represented by a graph, the purpose of a macro is to 
  allows not the reusability of components, making the resulting graph more consice
*/
export class Macro extends Graph { 
  constructor(
    public name:string,
    public description:string
  ){super()}



  public static fromGraph(name:string, description:string, graphData:Graph):Macro{
    const newmacro = new Macro(name, description);
    newmacro.components = graphData.components
    newmacro.connections = graphData.connections
    return newmacro;
  }
}