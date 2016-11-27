import { Graph, CommandComponent,IndexedGraph } from "../../graph";
import { Boundary } from "../../math";

type TeeParseCommandFn =  (argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections) => Graph
type parseCommandFn =     (argsNode: any, parser: any, tracker: any, previousCommand: any) => [Boundary, Graph]

export interface ICommonCommandParser {
    parseComponent?: (component: any, visualData: any, componentIndex: IndexedGraph, mapOfParsedComponents: any) => string
    visualSelectorOptions?;
    componentClass?: typeof CommandComponent;
}

export interface ITeeCommandParser extends ICommonCommandParser{
    parseCommand:  TeeParseCommandFn

}

export interface ICommandParser extends ICommonCommandParser {
    parseCommand:  parseCommandFn
    
}