(function(){
  var parser, astBuilder, parserCommand, VisualSelectorOptions, getPositionBoundaries, generateAST, parseAST, parseCommand, parseComponent;
  parser = {};
  astBuilder = require('./ast-builder/ast-builder');
  parserCommand = {
    cat: require('./commands/v/cat'),
    ls: require('./commands/v/ls'),
    grep: require('./commands/v/grep'),
    bunzip2: require('./commands/v/bunzip2'),
    bzcat: require('./commands/v/bzcat'),
    bzip2: require('./commands/v/bzip2'),
    compress: require('./commands/v/compress'),
    gzip: require('./commands/v/gzip'),
    gunzip: require('./commands/v/gunzip'),
    zcat: require('./commands/v/zcat')
  };
  VisualSelectorOptions = {
    cat: parserCommand.cat.VisualSelectorOptions,
    grep: parserCommand.grep.VisualSelectorOptions,
    ls: parserCommand.ls.VisualSelectorOptions
  };
  getPositionBoundaries = function(components){
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
  };
  generateAST = function(command){
    return astBuilder.parse(command);
  };
  parseAST = function(ast, tracker){
    var components, connections, LastCommandComponent, CommandComponent, i$, len$, commandNode, exec, args, nodeParser, result;
    components = [];
    connections = [];
    LastCommandComponent = null;
    CommandComponent = null;
    tracker == null && (tracker = {
      id: 0,
      x: 0,
      y: 0
    });
    for (i$ = 0, len$ = ast.length; i$ < len$; ++i$) {
      commandNode = ast[i$];
      exec = commandNode.exec, args = commandNode.args;
      nodeParser = parserCommand[exec];
      if (nodeParser.parseCommand) {
        result = nodeParser.parseCommand(args, parser, tracker, LastCommandComponent);
        components = components.concat(result.components);
        connections = connections.concat(result.connections);
        CommandComponent = result.components[0];
        if (LastCommandComponent) {
          connections.push({
            startNode: LastCommandComponent.id,
            startPort: 'output',
            endNode: CommandComponent.id,
            endPort: 'input'
          });
        }
        LastCommandComponent = CommandComponent;
      }
    }
    return {
      components: components,
      connections: connections
    };
  };
  parseCommand = function(command){
    return parseAST(generateAST(command));
  };
  parseComponent = function(command){
    return parserCommand[command.exec].parseComponent(command);
  };
  parser.generateAST = generateAST;
  parser.parseAST = parseAST;
  parser.astBuilder = astBuilder;
  parser.parseCommand = parseCommand;
  parser.parseComponent = parseComponent;
  exports.generateAST = generateAST;
  exports.parseAST = parseAST;
  exports.astBuilder = astBuilder;
  exports.parseCommand = parseCommand;
  exports.parseComponent = parseComponent;
  exports.VisualSelectorOptions = VisualSelectorOptions;
}).call(this);
