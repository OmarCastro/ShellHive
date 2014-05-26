declare function require(path:string):any;

var parser:any = {};

var astBuilder:{parse:(string)=>any} = require('./ast-builder/ast-builder');

import GraphModule = require("../common/graph");
export import Graph = GraphModule.Graph
export import Macro = GraphModule.Macro
export import GraphComponent = GraphModule.GraphComponent
export import MacroComponent = GraphModule.MacroComponent
export import Component = GraphModule.Component
export import Connection = GraphModule.Connection
export import FileComponent = GraphModule.FileComponent
export import CommandComponent = GraphModule.CommandComponent
export import IndexedGraph = GraphModule.IndexedGraph


export var parserCommand = {
  awk: require('./commands/awk'),
  cat: require('./commands/cat'),
  date: require('./commands/date'),
  ls: require('./commands/ls'),
  curl: require('./commands/curl'),
  grep: require('./commands/grep'),
  bunzip2: require('./commands/bunzip2'),
  diff: require('./commands/diff'),
  bzcat: require('./commands/bzcat'),
  bzip2: require('./commands/bzip2'),
  compress: require('./commands/compress'),
  gzip: require('./commands/gzip'),
  gunzip: require('./commands/gunzip'),
  zcat: require('./commands/zcat'),
  head: require('./commands/head'),
  tail: require('./commands/tail'),
  tr: require('./commands/tr'),
  tee: require('./commands/tee')
};

export var implementedCommands:any[] = [];

export var VisualSelectorOptions = {}
for (var key in parserCommand) {
    implementedCommands.push(key);
    VisualSelectorOptions[key] = parserCommand[key].VisualSelectorOptions
}

export function isImplemented(command:string){
  return parserCommand[command] != null;
};
/**
 * Parses the syntax of the command and
 * transforms into an Abstract Syntax Tree
 * @param command command
 * @return the resulting AST
 */
export function generateAST(command:string){
  return astBuilder.parse(command);
}
/**
 * Parses the Abstract Syntax Tree
 * and transforms it to a graph representation format
 * that can be used in the visual application
 *
 * @param ast - the Abstract Syntax Tree
 * @param tracker - and tracker the tracks the id of a component
 * @return the visual representation of the object
 */
export function parseAST(ast, tracker = {id: 0}):Graph{
  var LastCommandComponent, CommandComponent, exec, args, result_aux, result, comp, firstMainComponent;
  
  var graph = new Graph(); 
  var components = graph.components;
  var connections = graph.connections;
  var firstMainComponent = null
  LastCommandComponent = null;
  CommandComponent = null;
  for(var index = 0, _ref=ast, length=_ref.length;index<length;++index){
    var commandNode = _ref[index];
    exec = commandNode.exec, args = commandNode.args;
    var nodeParser = parserCommand[exec];
    if (nodeParser.parseCommand) {
      if (exec === 'tee') {
        return nodeParser.parseCommand(
          args, parser, tracker, LastCommandComponent,
          ast.slice(index + 1), firstMainComponent, components, connections);
      }
      result_aux = nodeParser.parseCommand(args, parser, tracker, LastCommandComponent);
      
      result = (result_aux instanceof Array) ? result_aux[1] : result_aux;

      components = components.concat(result.components);
      connections = connections.concat(result.connections);
      CommandComponent = result.firstMainComponent;
      if (LastCommandComponent) {
        comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
        var connection = new GraphModule.Connection(comp,'output',CommandComponent,'input');
        connections.push(connection);
      }
      LastCommandComponent = (result_aux instanceof Array) ? [result_aux[0], CommandComponent] : CommandComponent
      if (index < 1) {
        firstMainComponent = CommandComponent;
      }
    }
  }

  graph.connections = connections;
  graph.components = components;
  graph.firstMainComponent = firstMainComponent;
  graph.counter = tracker.id
  return graph;
}
/**
 * parses the command
 */
export function parseCommand(command){
  return parseAST(generateAST(command));
}




export function parseVisualData(VisualData:Graph){
  var indexedComponentList, initialComponent;
  if (VisualData.components.length < 1) {
    return '';
  }
  indexedComponentList = new IndexedGraph(VisualData);
  initialComponent = VisualData.firstMainComponent
  if (!(initialComponent instanceof CommandComponent)) {
    var ref = VisualData.components
    for(var i = 0, len = ref.length; i < len; ++i){
      if(ref[i] instanceof CommandComponent){
        initialComponent = ref[i];
        break;
      }
    }
  }
  return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
}


export function parseComponent(component, visualData:Graph, componentIndex, mapOfParsedComponents){
  switch (component.type) {
  case CommandComponent.type:
    return parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents);
  case MacroComponent.type:
    return parseVisualData(component.macro);
  }
}


/**
  find the first component to be parsed
*/
export function findFirstComponent(currentComponent:Component, visualData:Graph, componentIndex:IndexedGraph, mapOfParsedComponents){
  do {
    var isFirst = visualData.connections.every((connection)=>{
    if (connection.endComponent == currentComponent
    && connection.startPort === 'output' 
    && connection.endPort === 'input' 
    && mapOfParsedComponents[connection.startNode] !== true) {
      currentComponent = componentIndex.components[connection.startNode];
      return false
    }
    return true;
    });
  } while (isFirst == false);
  return currentComponent
}

/**
  Parse visual data from Component
*/
export function parseVisualDatafromComponent(currentComponent, visualData:Graph, componentIndex:IndexedGraph, mapOfParsedComponents){
  var commands:any[] = [];
  currentComponent = findFirstComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents)
  var parsedCommand = parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
  var parsedCommandIndex = commands.length;
  commands.push(parsedCommand);

  var outputs:any[] = []
  var stdErrors:any[] = []
  var exitCodes:any[] = []

  visualData.connections.filter((connection)=>{
    return connection.startNode === currentComponent.id
        && mapOfParsedComponents[connection.endNode] !== true
  }).forEach((connection)=>{
      var endNodeId = connection.endNode;
      var endNode = componentIndex.components[endNodeId]
      switch(connection.startPort){
        case 'output':  outputs.push(endNode)  ; break;
        case 'error':   stdErrors.push(endNode); break;
        case 'retcode': exitCodes.push(endNode); break;
      }
  });




  var parselist = function(list:any[]):any[]{
    var result:any[] = []
    for (var index = 0, length = list.length; index < length; ++index) {
      var component = list[index];
      if(component.type === FileComponent.type)
        result.push(component.filename);
      else{
        result.push(parseVisualDatafromComponent(component, visualData, componentIndex, mapOfParsedComponents));
      }
    }
    return result;
  }





  var nextcommands:any[] = parselist(outputs);
  var nextErrcommands:any[] = parselist(stdErrors);
  var nextExitcommands:any[] = parselist(exitCodes);
  
  var teeResultArray = function(components:any[],compiledComponents:any[]):string[]{
    var comm:string[] = ["tee"];
    compiledComponents.forEach((compiledComponent, index)=>{
      if(components[index].type === FileComponent.type){
        comm.push(compiledComponent);
      } else {
        comm.push(">(("+compiledComponent+") &> /dev/null )");       
      }
    });
    return comm;
  }

  function teeResult(components:any[],compiledComponents:any[]):string{
    return teeResultArray(components,compiledComponents).join(" ");
  }

  if (nextcommands.length > 1) {
    var comm:any = teeResultArray(outputs,nextcommands);
    comm.pop()
    commands.push(comm.join(" "));
    commands.push(nextcommands[nextcommands.length - 1]);
  } else if (nextcommands.length === 1) {
    if (outputs[0].type === FileComponent.type) {
      commands[parsedCommandIndex] += " > " + outputs[0].filename;
    } else {
      commands.push(nextcommands[0]);
    }
  }



  if (nextErrcommands.length > 1) {
    comm = teeResult(stdErrors,nextErrcommands);
    commands[parsedCommandIndex] += " 2> >((" + comm + ") &> /dev/null )";
  } else if (nextErrcommands.length === 1) {
    if (stdErrors[0].type === FileComponent.type) {
      commands[parsedCommandIndex] += " 2> " + stdErrors[0].filename;
    } else {
      commands[parsedCommandIndex] += " 2> >((" + nextErrcommands[0] + ") &> /dev/null )";
    }
  }

  if (nextExitcommands.length > 1) {
    comm = teeResult(exitCodes,nextExitcommands);
    commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + comm + " &> /dev/null)";
  } else if (nextExitcommands.length === 1) {
    if (exitCodes[0].type === FileComponent.type) {
      commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? > " + exitCodes[0].filename + "))";
    } else {
      commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + nextExitcommands[0] + ") &> /dev/null)";
    }
  }


  return commands.join(" | ");
}



export function createMacro (name, description, command, fromMacro){
  if(fromMacro){
    return Macro.fromGraph(name,description,cloneGraph(fromMacro));
  } else if (command) {
    return Macro.fromGraph(name,description,parseCommand(command));
  } else return new Macro(name, description);
};

/**
  Creates a component based on the first word of the content
  if the first word contains dots, create a file
  if the first word is a command creates a command component instead
*/
export function createComponentDinamicText(text: string){
  if(text === ""){ return null }
  var words = text.replace("\n"," ").split(" ");
  var firstWord = words[0];
  if(firstWord.indexOf(".") > -1){
    return new FileComponent(text)
  } else if(isImplemented(firstWord)){
    return parseCommand(text).components[0]
  } else return null
  
}


export function graphFromJson(json:string){
  return graphFromJsonObject(JSON.parse(json));
}

export function graphFromJsonObject(jsonObj){
  var newGraph = new Graph();
  var componentMap = {}
  for(var i in jsonObj){
      newGraph[i] = jsonObj[i]
  }
  var components = []
  jsonObj.components.forEach(function cloneComponent(component){
    var newComponent; 
    switch (component.type) {
      case CommandComponent.type:
        newComponent = new parserCommand[component.exec].componentClass
        break;
      case FileComponent.type:
        newComponent = new FileComponent(component.filename)
        break;
    }
    /* istanbul ignore next */
    if(!newComponent){ return; }

    for(var i in component){
      newComponent[i] = component[i]
    }
    componentMap[newComponent.id] = newComponent
    components.push(newComponent)
    
  })
  newGraph.components = components;
  newGraph.connections = [];
  jsonObj.connections.forEach(function connectCreatedComponents(connection){
    newGraph.connect(
      componentMap[connection.startNode], connection.startPort,
      componentMap[connection.endNode], connection.endPort
    );
  })
  newGraph.firstMainComponent = componentMap[<any> newGraph.firstMainComponent]
  return newGraph;
}

export function cloneGraph(graph){
  var json = JSON.stringify(graph);
  return graphFromJson(json);
}

parser.generateAST =  generateAST;
parser.parseAST = parseAST;
parser.astBuilder = astBuilder;
parser.parseCommand = parseCommand;
parser.parseComponent = parseComponent;
parser.implementedCommands = implementedCommands;
parser.parseVisualData = parseVisualData;
export var parseGraph = parseVisualData;
