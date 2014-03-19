(function(){
  var Boundaries, ComponentConnections, optionsParser, Iterator, justAccept, getComponentById, addFileComponent, commonNodeParsing, commonParseCommand, parseFlagsAndSelectors, commonParseComponent, join$ = [].join;
  Boundaries = require("./_graphlayout");
  ComponentConnections = require("../utils/componentConnections");
  optionsParser = require("../utils/optionsParser");
  exports.Iterator = Iterator = (function(){
    Iterator.displayName = 'Iterator';
    var prototype = Iterator.prototype, constructor = Iterator;
    function Iterator(ArgList){
      this.index = 0;
      this.argList = ArgList;
      this.length = ArgList.length;
      this.current = ArgList[0];
    }
    prototype.hasNext = function(){
      return this.index !== this.length;
    };
    prototype.next = function(){
      return this.current = this.argList[this.index++];
    };
    prototype.rest = function(){
      return this.argList.slice(this.index);
    };
    return Iterator;
  }());
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
  function typeOf(arg){
    if (typeof arg === 'string' && arg.length > 0) {
      if (arg[0] === '-' && arg.length > 1) {
        if (arg[1] === '-') {
          return 'longOption';
        }
        return 'shortOptions';
      } else {
        return 'string';
      }
    }
    if (arg instanceof Array) {
      return arg[0];
    }
  }
  justAccept = function(){
    return function(){};
  };
  function generate(parser){
    var longOptions, shortOptions, key, val, results$ = [];
    longOptions = parser.longOptions, shortOptions = parser.shortOptions;
    for (key in longOptions) {
      val = longOptions[key];
      if (val[0] === 'same') {
        results$.push(longOptions[key] = shortOptions[val[1]]);
      }
    }
    return results$;
  }
  getComponentById = function(visualData, id){
    var i$, ref$, len$, x;
    for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (x.id === id) {
        return x;
      }
    }
    return null;
  };
  addFileComponent = function(options, filename){
    var componentData, connectionsToPush, tracker, newComponent;
    componentData = options.componentData, connectionsToPush = options.connectionsToPush, tracker = options.tracker;
    componentData.files.push(argNode);
    newComponent = {
      type: 'file',
      filename: argNode,
      id: tracker.id,
      position: {
        x: 0,
        y: 0
      }
    };
    return connectionsToPush.push({
      startNode: tracker.id,
      startPort: 'output',
      endPort: "file" + (componentData.files.length - 1)
    });
  };
  commonNodeParsing = {
    string: function(options){
      return addFileComponent(options, options.iterator.current);
    },
    shortOptions: function(options){
      return addFileComponent(options, options.iterator.current);
    },
    longOption: function(options){
      return addFileComponent(options, options.iterator.current);
    }
  };
  commonParseCommand = function(optionsParserData, defaultComponentData, argNodeParsing){
    return function(argsNode, parser, tracker, previousCommand){
      var componentData, boundaries, connections, stdoutRedirection, stderrRedirection, result, iter, argNode, newComponent, inputPort, subresult, x$, bbox, y$, ref$, y;
      componentData = defaultComponentData();
      boundaries = [];
      if (previousCommand) {
        if (previousCommand instanceof Array) {
          boundaries.push(previousCommand[0]);
        } else {
          boundaries.push[Boundaries.getBoundaries([previousCommand])];
        }
      }
      connections = new ComponentConnections(componentData);
      stdoutRedirection = null;
      stderrRedirection = null;
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
            newComponent = {
              type: 'file',
              filename: argNode,
              id: tracker.id,
              position: {
                x: 0,
                y: 0
              }
            };
            inputPort = "file" + componentData.files.length;
            componentData.files.push(argNode);
            connections.addConnectionToInputPort(inputPort, {
              id: tracker.id,
              port: 'output'
            });
            tracker.id++;
            result.components.push(newComponent);
            boundaries.push(Boundaries.getBoundaries([newComponent]));
          }
          break;
        case 'inFromProcess':
          subresult = parser.parseAST(argNode[1], tracker);
          boundaries.push(Boundaries.getBoundaries(subresult.components));
          x$ = result;
          x$.components = x$.components.concat(subresult.components);
          x$.connections = x$.connections.concat(subresult.connections);
          inputPort = "file" + componentData.files.length;
          connections.addConnectionToInputPort(inputPort, {
            id: tracker.id - 1,
            port: 'output'
          });
          componentData.files.push(["pipe", tracker.id - 1]);
          break;
        case 'outTo':
          newComponent = {
            type: 'file',
            filename: argNode[1],
            id: tracker.id,
            position: {
              x: 0,
              y: 0
            }
          };
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
          newComponent = {
            type: 'file',
            filename: argNode[1],
            id: tracker.id,
            position: {
              x: 0,
              y: 0
            }
          };
          connections.addConnectionFromErrorPort({
            id: tracker.id,
            port: 'input'
          });
          tracker.id++;
          result.components.push(newComponent);
          stderrRedirection = newComponent;
        }
      }
      bbox = Boundaries.arrangeLayout(boundaries);
      y$ = componentData;
      y$.position = bbox[1];
      y$.id = tracker.id;
      if (stdoutRedirection) {
        stdoutRedirection.position = (ref$ = clone$(bbox[1]), ref$.x = bbox[1].x + 400, ref$);
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
  parseFlagsAndSelectors = function(component, options){
    var flagOptions, selectorOptions, sFlags, lFlags, key, ref$, value, flag, that, val;
    flagOptions = options.flagOptions, selectorOptions = options.selectorOptions;
    sFlags = [];
    lFlags = [];
    for (key in ref$ = component.flags) {
      value = ref$[key];
      if (value) {
        flag = flagOptions[key];
        if (flag[0] !== '-') {
          sFlags.push(flag);
        } else {
          lFlags.push(flag);
        }
      }
    }
    if (component.selectors) {
      for (key in ref$ = component.selectors) {
        value = ref$[key];
        if ((that = selectorOptions[key][value]) != null) {
          val = that;
          if (val[0] !== '-') {
            sFlags.push(val);
          } else {
            lFlags.push(val);
          }
        }
      }
    }
    if (sFlags.length > 0) {
      sFlags = "-" + join$.call(sFlags, '');
    }
    if (lFlags.length > 0) {
      if (lFlags.length > 0) {
        sFlags += " ";
      }
      sFlags += join$.call(lFlags, ' ');
    }
    return sFlags;
  };
  commonParseComponent = function(flagOptions, selectorOptions, parameterOptions, beforeJoin){
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
  import$(exports, optionsParser);
  import$(exports, Boundaries);
  exports.typeOf = typeOf;
  exports.justAccept = justAccept;
  exports.generate = generate;
  exports.commonParseCommand = commonParseCommand;
  exports.commonParseComponent = commonParseComponent;
  exports.getComponentById = getComponentById;
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
