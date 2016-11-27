import {Graph, IndexedGraph, Connection, Component} from "../../graph"
import { parserCommand } from "../commands/_supported_commands"
import {  ICommandParser, ITeeCommandParser  } from "../commands/_command-parser.class"
import { parser } from "../parser"


interface ASTCommandNode {
  exec: string,
  args: any[];
}
interface AST extends Array<ASTCommandNode> {}


/**
 * Parses the Abstract Syntax Tree
 * and transforms it to a graph representation format
 * that can be used in the visual application
 *
 * @param ast - the Abstract Syntax Tree
 * @param tracker - and tracker the tracks the id of a component
 * @return the visual representation of the object
 */
export function parseAST(ast: AST, tracker = {id: 0}):Graph{
  const graph = new Graph(); 
  const components = graph.components;
  const connections = graph.connections;
  let firstMainComponent = null
  let LastCommandComponent = null;
  ast.forEach((commandNode, index) => {
    const exec = commandNode.exec;
    const args = commandNode.args;
    const nodeParser = parserCommand[exec];
    if (nodeParser.parseCommand) {
      if (exec === 'tee') {
        return (nodeParser as ITeeCommandParser).parseCommand(args, parser, tracker, LastCommandComponent,ast.slice(index + 1), firstMainComponent, components, connections);
      }
      const result_aux = (nodeParser as ICommandParser).parseCommand(args, parser, tracker, LastCommandComponent);
      
      const result = (result_aux instanceof Array) ? result_aux[1] : result_aux;

      components.push(...result.components)
      connections.push(...result.connections)
      const CommandComponent = result.firstMainComponent;
      if (LastCommandComponent) {
        const comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
        const connection = new Connection(comp,'output',CommandComponent,'input');
        connections.push(connection);
      }
      LastCommandComponent = (result_aux instanceof Array) ? [result_aux[0], CommandComponent] : CommandComponent
      if (index < 1) {
        firstMainComponent = CommandComponent;
      }
    }
  })

  graph.connections = connections;
  graph.components = components;
  graph.firstMainComponent = firstMainComponent;
  graph.counter = tracker.id
  return graph;
}
