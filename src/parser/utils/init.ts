
import optionsParser = require("../utils/optionsParser");
import Iterator = optionsParser.Iterator;

import parser = require("../parser");
import sanitizer = require("./sanitizer");

import GraphModule = require("../../common/graph");
import Boundary = GraphModule.Boundary;
import Graph = GraphModule.Graph;
import IndexedGraph = GraphModule.IndexedGraph;
import Connection = GraphModule.Connection;
import Component = GraphModule.Component;
import CommandComponent = GraphModule.CommandComponent;
import FileComponent = GraphModule.FileComponent;


/**
  gets the type of argument Nodes

  the possible types are:
    argument - a single argument
    shortOptions - a list of options e.g -{options}
    longOption - a long option e.g --{option}
    inFromProccess - a link to a file(pipe) to read
    outToProccess - a link to a file(pipe) to write

  @returns {string} the type os argument
*/
export function typeOf(arg:string):string;
export function typeOf(arg:string[]):string;
export function typeOf(arg:any):string{
  if (typeof arg === 'string' && arg.length > 0){
    if (arg[0] === '-' && arg.length > 1) {
      if (arg[1] === '-') { return 'longOption' }
      else return 'shortOptions'
    } else {
      return 'string';
    }
  }
  else if (arg instanceof Array) {
    return arg[0];
  } else return 'string';
}


/*getComponentById = function(visualData, id){
  var i$, ref$, len$, x;
  for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x.id === id) {
      return x;
    }
  }
  return null;
};*/


/**
  Adds a file component to the
*/
export function addFileComponent(componentData, connections, filename, id:number){
  var newComponent = new FileComponent(filename)
  newComponent.id = id
  
  var inputPort = "file" + (componentData.files.length);
  connections.push(new Connection(newComponent, 'output', componentData, inputPort));

  componentData.files.push(filename);
  return newComponent
};


/*var commonNodeParsing = {
  string: function(options){
    return addFileComponent(options, options.iterator.current);
  },
  shortOptions: function(options){
    return addFileComponent(options, options.iterator.current);
  },
  longOption: function(options){
    return addFileComponent(options, options.iterator.current);
  }
};*/


export function commonParseCommand(optionsParserData, defaultComponentData, argNodeParsing?){
  return function(argsNode, parser, tracker, previousCommand){
    var  stdoutRedirection:Component, 
      stderrRedirection:Component, argNode, newComponent, inputPort, subresult, ref$, y;
    var componentData = defaultComponentData();
    
    var boundaries:Boundary[] = [];
    if (previousCommand) { boundaries.push(previousCommand[0]) }
    var result = new Graph()
    result.components = [componentData];

    result.firstMainComponent = componentData
    var iter = new Iterator(argsNode)
    while (iter.hasNext()) {
      var argNode = iter.next();
      switch (typeOf(argNode)) {
      case 'shortOptions':
        optionsParser.parseShortOptions(optionsParserData, componentData, iter);
        break;
      case 'longOption':
        optionsParser.parseLongOptions(optionsParserData, componentData, iter);
        break;
      case 'string':
        var addfile = true
        if (argNodeParsing && argNodeParsing.string) {
          addfile = argNodeParsing.string(componentData, argNode) == "continue";
        } 
        if(addfile){
          newComponent = addFileComponent(componentData,result.connections,argNode,
            tracker.id++);
          result.components.push(newComponent);
          boundaries.push(Boundary.createFromComponent(newComponent));
        }
        break;

      case 'inFromProcess':
        subresult = parser.parseAST(argNode[1], tracker);
        boundaries.push(Boundary.createFromComponents(subresult.components));
        result.expand(subresult);
        inputPort = "file" + componentData.files.length;

        var subComponents = subresult.components
        for (var i = subComponents.length - 1; i >= 0; i--) {
          if(subComponents[i].id == tracker.id - 1){
            result.connections.push(new Connection(subComponents[i], 'output', componentData, inputPort));
            break;
          }
        }

        componentData.files.push(["pipe", tracker.id - 1]);

        break;
      case 'outToFile':
        newComponent = new FileComponent(argNode[1])
        newComponent.id = tracker.id
        result.connections.push(new Connection(componentData, 'output', newComponent, 'input'));

        tracker.id++;
        result.components.push(newComponent);
        stdoutRedirection = newComponent;
        break;
      case 'errToFile':
        newComponent = new FileComponent(argNode[1])
        newComponent.id = tracker.id
        result.connections.push(new Connection(componentData, 'error', newComponent, 'input'));
        tracker.id++;
        result.components.push(newComponent);
        stderrRedirection = newComponent;
      }
    }
    var bbox:any[] = Boundary.arrangeLayout(boundaries);
    componentData.position = bbox[1];
    componentData.id = tracker.id;
    if (stdoutRedirection) {
      var position = stdoutRedirection.position
      position.x = bbox[1].x + 400
      position.y = bbox[1].y
    }
    if (stderrRedirection) {
      y = stdoutRedirection ? 100 : 0;
      stderrRedirection.position = {
        x: bbox[1].x + 400,
        y: bbox[1].y + y
      };
    }
    //result.connections = result.connections.concat(connections.toConnectionList());
    tracker.id++;
    return [bbox[0], result];
  };
};




function parseFlagsAndSelectors(component:CommandComponent, options):string{
  var key, selectors, value, flag, flags, that, val;
  var flagOptions = options.flagOptions; 
  var selectorOptions = options.selectorOptions;
  var sFlags:any[] = [];
  var lFlags:any[] = [];
  var resultSFlags:string
  var resultLFlags:string

  for (key in flags = component.flags) {
    value = flags[key];
    if (value) {
      flag = flagOptions[key];
      /* istanbul ignore if */ 
      if(!flag){
        throw [key,"doesn't exist in ",flagOptions].join('');
      } else sFlags.push(flag);
    }
  }

  if (component.selectors) {
    for (key in selectors = component.selectors) {
      value = selectors[key];
      var optionValue = selectorOptions[key][value.name]
      if (optionValue != null) {
        /* istanbul ignore if */ 
        if(!optionValue) {
          throw [key,".",value,"doesn't exist in ",selectorOptions].join('');          
        } else if(value.type == "numeric parameter"){
          lFlags.push("-" + optionValue + value.value);
        } else if (optionValue[0] !== '-') {
          sFlags.push(optionValue);
        } else {
          lFlags.push(optionValue);
        }
      }
    }
  }

  var containsSFlags:boolean = sFlags.length > 0
  var containsLFlags:boolean = lFlags.length > 0

  if(containsSFlags && containsLFlags){
    return "-" + sFlags.join('') + " " + lFlags.join(' ')
  } else if (containsSFlags) {
    return "-" + sFlags.join('');
  } else if (containsLFlags) {
    return lFlags.join(' ');
  } else return "";

};


function parseFlagsAndSelectors(component:CommandComponent, options):string{

}

export function commonParseComponent(flagOptions, selectorOptions, parameterOptions?, beforeJoin?:(component, exec, flags, files, parameters)=>string){
  var options;
  options = {
    flagOptions: flagOptions,
    selectorOptions: selectorOptions,
    parameterOptions: parameterOptions
  };

  return function(component, visualData, componentIndex:IndexedGraph, mapOfParsedComponents){
    var exec:any[] = [component.exec];
    var flags = parseFlagsAndSelectors(component, options);
    var parameters:any = [];
    var Componentparameters = component.parameters;
    var result:any;

    mapOfParsedComponents[component.id] = true;


    for (var key in Componentparameters) {
      var value = Componentparameters[key];
      var option = parameterOptions[key];
      if (option && value) {
        var parameterOption = parameterOptions[key]
        if(parameterOption[0] == "-"){
          result = parameterOption;
        } else{ 
          result = "-" + parameterOption;
        }

        var sanitizedVal = sanitizer.sanitizeArgument(value)
        if(parameterOption[0] == "-" || sanitizer.sanitizedWithSingleQuotes(sanitizedVal)){
           result += " ";
        }
        result += sanitizedVal;
        parameters.push(result);
      } else if(value){
        parameters.push(sanitizer.sanitizeArgument(value));
      }
    }

    var files = !component.files ? [] : component.files.map(file => {
        if (file instanceof Array) { //TODO: remove this "if" when removing old command generator
          var subCommand = parser.parseVisualDatafromComponent(componentIndex.components[file[1]], visualData, componentIndex, mapOfParsedComponents);
          return "<(" + subCommand + ")"
        } else return sanitizer.sanitizeArgument(file)

      });

    if (parameters.length > 0) {
      parameters = parameters.join(' ');
    }
    if (beforeJoin) {
      return beforeJoin(component, exec, flags, files, parameters);
    } else {
      if(flags){exec = exec.concat(flags)}
      if(parameters){exec = exec.concat(parameters)}
      if(files){exec = exec.concat(files)}
      return exec.join(' ');
    }
  };
};



export var select = optionsParser.select;
export var sameAs = optionsParser.sameAs;
export var switchOn = optionsParser.switchOn;
export var select = optionsParser.select;
