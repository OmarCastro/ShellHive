declare var exports:any;

var parseFlagsAndSelectors, join$ = [].join;

import optionsParser = require("../utils/optionsParser");
import ComponentConnections = require("../utils/componentConnections");

import GraphModule = require("../../common/graph");
import Boundary = GraphModule.Boundary;
import Graph = GraphModule.Graph;
import Component = GraphModule.Component;
import FileComponent = GraphModule.FileComponent;

class Iterator{
  index:number = 0;
  argList:any[];
  length:number;
  current:any;

  public constructor(ArgList:any[]){
    this.argList = ArgList;
    this.length = ArgList.length;
    this.current = ArgList[0];
  }

  public hasNext(){ return this.index !== this.length }
  public next(){return this.current = this.argList[this.index++] }
  public rest(){return this.argList.slice(this.index) }
}


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
  if (typeof arg === 'string' && arg.length > 0) {
    if (arg[0] === '-' && arg.length > 1) {
      if (arg[1] === '-') { return 'longOption' }
      else return 'shortOptions'
    } else {
      return 'string';
    }
  }
  else if (arg instanceof Array) {
    return arg[0];
  }
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
function addFileComponent(componentData, connections, filename, id:number){
  var newComponent = new FileComponent(filename)
  newComponent.id = id

  connections.addConnectionToInputPort("file" + (componentData.files.length),{
    id: id,
    port: 'output'
  });

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
    var componentData,
      stdoutRedirection:Component, 
      stderrRedirection:Component, result, iter, argNode, newComponent, inputPort, subresult, ref$, y;
    componentData = defaultComponentData();
    
    var boundaries:Boundary[] = [];
    if (previousCommand) {
      if (previousCommand instanceof Array) {
        boundaries.push(previousCommand[0]);
      } else {
        boundaries.push(Boundary.createFromComponent(previousCommand));
      }
    }
    var connections:ComponentConnections = new ComponentConnections(componentData);
    result = {
      components: [componentData],
      connections: [],
      mainComponent: componentData
    };
    iter = new Iterator(argsNode);
    while (argNode = iter.next()) {
      switch (typeOf(argNode)) {
      case 'shortOptions':
        optionsParser.parseShortOptions(optionsParserData, componentData, iter);
        break;
      case 'longOption':
        optionsParser.parseLongOptions(optionsParserData, componentData, iter);
        break;
      case 'string':
        if (argNodeParsing && argNodeParsing.string) {
          argNodeParsing.string(componentData, argNode);
        } else {
          newComponent = addFileComponent(componentData,connections,argNode,
            tracker.id++);
          result.components.push(newComponent);
          boundaries.push(Boundary.createFromComponent(newComponent));
        }
        break;
      case 'inFromProcess':
        subresult = parser.parseAST(argNode[1], tracker);
        boundaries.push(Boundary.createFromComponents(subresult.components));
        result.components = result.components.concat(subresult.components);
        result.connections = result.connections.concat(subresult.connections);
        inputPort = "file" + componentData.files.length;
        connections.addConnectionToInputPort(inputPort, {
          id: tracker.id - 1,
          port: 'output'
        });
        componentData.files.push(["pipe", tracker.id - 1]);
        break;
      case 'outTo':
        newComponent = new FileComponent(argNode[1])
        newComponent.id = tracker.id
        connections.addConnectionFromOutputPort({
          id: tracker.id,
          port: 'input'
        });
        tracker.id++;
        result.components.push(newComponent);
        stdoutRedirection = newComponent;
        break;
      case 'errTo':
        console.log('errTo!!');
        newComponent = new FileComponent(argNode[1])
        newComponent.id = tracker.id
        connections.addConnectionFromErrorPort({
          id: tracker.id,
          port: 'input'
        });
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
    result.connections = result.connections.concat(connections.toConnectionList());
    tracker.id++;
    return [bbox[0], result];
  };
};




parseFlagsAndSelectors = function(component, options):string{
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
      if(!flag){
        //crash and burn (should not happen)
        throw [key,"doesn't exist in ",flagOptions].join('');
      } else if (flag[0] !== '-') {
        sFlags.push(flag);
      } else {
        lFlags.push(flag);
      }
    }
  }

  if (component.selectors) {
    for (key in selectors = component.selectors) {
      value = selectors[key];
      var optionValue = selectorOptions[key][value.name]
      if (optionValue != null) {
        if(!optionValue) {
          //crash and burn (should not happen)
          throw [key,".",value,"doesn't exist in ",selectorOptions].join('');          
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
    return sFlags.join(' ');
  } else return "";

};


export function commonParseComponent(flagOptions, selectorOptions, parameterOptions?, beforeJoin?){
  var options;
  options = {
    flagOptions: flagOptions,
    selectorOptions: selectorOptions,
    parameterOptions: parameterOptions
  };
  return function(component, visualData, componentIndex, mapOfParsedComponents, parseComponent){
    var exec, flags, parameters, res$, key, ref$, value, files, i$, len$, file, subCommand;
    exec = [component.exec];
    mapOfParsedComponents[component.id] = true;
    flags = parseFlagsAndSelectors(component, options);
    res$ = [];
    for (key in ref$ = component.parameters) {
      value = ref$[key];
      if (value) {
        if (value.indexOf(" ") >= 0) {
          res$.push("\"-" + parameterOptions[key] + value + "\"");
        } else {
          res$.push("-" + parameterOptions[key] + value);
        }
      }
    }
    parameters = res$;
    if (component.files) {
      res$ = [];
      for (i$ = 0, len$ = (ref$ = component.files).length; i$ < len$; ++i$) {
        file = ref$[i$];
        if (file instanceof Array) {
          subCommand = parseComponent(componentIndex[file[1]], visualData, componentIndex, mapOfParsedComponents);
          res$.push("<(" + subCommand + ")");
        } else if (file.indexOf(" ") >= 0) {
          res$.push("\"" + file + "\"");
        } else {
          res$.push(file);
        }
      }
      files = res$;
    } else {
      files = [];
    }
    if (parameters.length > 0) {
      parameters = join$.call(parameters, ' ');
    }
    if (beforeJoin) {
      return beforeJoin(component, exec, flags, files, parameters);
    } else {
      return join$.call(exec.concat(flags, parameters, files), ' ');
    }
  };
};


export var select = optionsParser.select;
export var sameAs = optionsParser.sameAs;
export var switchOn = optionsParser.switchOn;
export var select = optionsParser.select;
