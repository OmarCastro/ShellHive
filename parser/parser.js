(function(){
  var parser, astBuilder, parserCommand, implementedCommands, res$, key, VisualSelectorOptions, indexComponents, join$ = [].join;
  parser = {};
  astBuilder = require('./ast-builder/ast-builder');
  parserCommand = {
    awk: require('./commands/v/awk'),
    cat: require('./commands/v/cat'),
    ls: require('./commands/v/ls'),
    grep: require('./commands/v/grep'),
    bunzip2: require('./commands/v/bunzip2'),
    bzcat: require('./commands/v/bzcat'),
    bzip2: require('./commands/v/bzip2'),
    compress: require('./commands/v/compress'),
    gzip: require('./commands/v/gzip'),
    gunzip: require('./commands/v/gunzip'),
    zcat: require('./commands/v/zcat'),
    tee: require('./commands/v/tee')
  };
  res$ = [];
  for (key in parserCommand) {
    if (key !== 'tee') {
      res$.push(key);
    }
  }
  implementedCommands = res$;
  function isImplemented(command){
    return !!parserCommand(command);
  }
  VisualSelectorOptions = {
    cat: parserCommand.cat.VisualSelectorOptions,
    grep: parserCommand.grep.VisualSelectorOptions,
    ls: parserCommand.ls.VisualSelectorOptions,
    bunzip2: parserCommand.gzip.VisualSelectorOptions,
    bzcat: parserCommand.gzip.VisualSelectorOptions,
    bzip2: parserCommand.gzip.VisualSelectorOptions,
    gzip: parserCommand.gzip.VisualSelectorOptions,
    gunzip: parserCommand.gzip.VisualSelectorOptions,
    zcat: parserCommand.gzip.VisualSelectorOptions
  };
  function getPositionBoundaries(components){
    var xs, ys, xe, ye, i$, len$, component, position, px, py, xy;
    xs = components[0].position.x;
    ys = components[0].position.y;
    xe = xs;
    ye = ye;
    for (i$ = 0, len$ = components.length; i$ < len$; ++i$) {
      component = components[i$];
      position = component.position;
      px = position.x;
      py = position.y;
      if (px < xs) {
        xs = px;
      }
      if (px < xy) {
        xy = py;
      }
      if (px > xe) {
        xe = px;
      }
      if (px > xe) {
        xe = py;
      }
    }
    return {
      xs: xs,
      ys: ys,
      xe: xe,
      ye: ye
    };
  }
  function generateAST(command){
    return astBuilder.parse(command);
  }
  function parseAST(ast, tracker){
    var components, connections, LastCommandComponent, CommandComponent, i$, len$, index, commandNode, exec, args, nodeParser, result_aux, result, comp, firstMainComponent;
    components = [];
    connections = [];
    ({
      firstMainComponent: null
    });
    LastCommandComponent = null;
    CommandComponent = null;
    tracker == null && (tracker = {
      id: 0,
      x: 0,
      y: 0
    });
    for (i$ = 0, len$ = ast.length; i$ < len$; ++i$) {
      index = i$;
      commandNode = ast[i$];
      exec = commandNode.exec, args = commandNode.args;
      nodeParser = parserCommand[exec];
      if (nodeParser.parseCommand) {
        if (exec === 'tee') {
          return nodeParser.parseCommand(args, parser, tracker, LastCommandComponent, ast.slice(index + 1), firstMainComponent, components, connections);
        }
        result_aux = nodeParser.parseCommand(args, parser, tracker, LastCommandComponent);
        result = null;
        if (result_aux instanceof Array) {
          result = result_aux[1];
        } else {
          result = result_aux;
        }
        components = components.concat(result.components);
        connections = connections.concat(result.connections);
        CommandComponent = result.mainComponent;
        if (LastCommandComponent) {
          comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
          connections.push({
            startNode: comp.id,
            startPort: 'output',
            endNode: CommandComponent.id,
            endPort: 'input'
          });
        }
        if (result_aux instanceof Array) {
          LastCommandComponent = [result_aux[0], CommandComponent];
        } else {
          LastCommandComponent = CommandComponent;
        }
        if (CommandComponent === void 8) {
          "mi";
        }
        if (index < 1) {
          firstMainComponent = CommandComponent.id;
        }
      }
    }
    return {
      firstMainComponent: firstMainComponent,
      components: components,
      connections: connections
    };
  }
  function parseCommand(command){
    return parseAST(generateAST(command));
  }
  function parseComponent(component, visualData, componentIndex, mapOfParsedComponents){
    return parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents, parseVisualDatafromComponent);
  }
  indexComponents = function(visualData){
    var i$, ref$, len$, comp, results$ = {};
    for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
      comp = ref$[i$];
      results$[comp.id] = comp;
    }
    return results$;
  };
  function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents){
    var commands, isFirst, i$, ref$, len$, connection, outputs, res$, endNodeId, j$, ref1$, len1$, component, endNode, nextcommands, comm, to$, i;
    commands = [];
    do {
      isFirst = true;
      for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
        connection = ref$[i$];
        if (connection.endNode === currentComponent.id && connection.startPort === 'output' && connection.endPort === 'input' && mapOfParsedComponents[connection.startNode] !== true) {
          isFirst = false;
          currentComponent = componentIndex[connection.startNode];
          break;
        }
      }
    } while (isFirst = false);
    commands.push(parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents));
    res$ = [];
    for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
      connection = ref$[i$];
      if (connection.startNode === currentComponent.id && connection.startPort === 'output' && mapOfParsedComponents[connection.endNode] !== true) {
        endNodeId = connection.endNode;
        for (j$ = 0, len1$ = (ref1$ = visualData.components).length; j$ < len1$; ++j$) {
          component = ref1$[j$];
          if (component.id === endNodeId) {
            endNode = component;
            break;
          }
        }
        res$.push(endNode);
      }
    }
    outputs = res$;
    res$ = [];
    for (i$ = 0, len$ = outputs.length; i$ < len$; ++i$) {
      component = outputs[i$];
      res$.push(parseVisualDatafromComponent(component, visualData, componentIndex, mapOfParsedComponents));
    }
    nextcommands = res$;
    if (nextcommands.length > 1) {
      comm = "tee";
      for (i$ = 0, to$ = nextcommands.length - 2; i$ <= to$; ++i$) {
        i = i$;
        comm += " >(" + nextcommands[i] + ")";
      }
      commands.push(comm);
      commands.push(nextcommands[nextcommands.length - 1]);
    } else if (nextcommands.length === 1) {
      commands.push(nextcommands[0]);
    }
    return join$.call(commands, " | ");
  }
  function parseVisualData(VisualData){
    var indexedComponentList, initialComponent;
    indexedComponentList = indexComponents(VisualData);
    initialComponent = indexedComponentList[VisualData.firstMainComponent];
    if (initialComponent === null) {
      return;
    }
    return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
  }
  parser.generateAST = generateAST;
  parser.parseAST = parseAST;
  parser.astBuilder = astBuilder;
  parser.parseCommand = parseCommand;
  parser.parseComponent = parseComponent;
  parser.implementedCommands = implementedCommands;
  parser.parseVisualData = parseVisualData;
  exports.generateAST = generateAST;
  exports.parseAST = parseAST;
  exports.astBuilder = astBuilder;
  exports.parseCommand = parseCommand;
  exports.parseComponent = parseComponent;
  exports.implementedCommands = implementedCommands;
  exports.parseVisualData = parseVisualData;
  exports.VisualSelectorOptions = VisualSelectorOptions;
}).call(this);
