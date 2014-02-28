parser = {}

astBuilder = require './ast-builder/ast-builder'

parserCommand =
  cat:       require './commands/v/cat'
  ls:        require './commands/v/ls'
  grep:      require './commands/v/grep'
  bunzip2:   require './commands/v/bunzip2'
  bzcat:     require './commands/v/bzcat'
  bzip2:     require './commands/v/bzip2'
  compress:  require './commands/v/compress'
  gzip:      require './commands/v/gzip'
  gunzip:    require './commands/v/gunzip'
  zcat:      require './commands/v/zcat'

VisualSelectorOptions = 
  cat:  parserCommand.cat.VisualSelectorOptions
  grep: parserCommand.grep.VisualSelectorOptions
  ls:   parserCommand.ls.VisualSelectorOptions

getPositionBoundaries = (components) ->
  xs = components[0].position.x
  ys = components[0].position.y
  xe = xs
  ye = ye
  for component in components
    position = component.position
    px = position.x
    py = position.y
    xs = px if px < xs
    xy = py if px < xy
    xe = px if px > xe
    xe = py if px > xe
  {xs,ys,xe,ye}

generateAST = (command) -> astBuilder.parse(command)

parseAST = (ast, tracker) -> 
  components = []
  connections = []
  LastCommandComponent = null #commponent in previous commanf
  CommandComponent = null #component in command
  tracker ?= {id: 0, x:0, y:0}
  for commandNode in ast
    {exec,args} = commandNode
    nodeParser = parserCommand[exec]
    if nodeParser.parseCommand
      result = nodeParser.parseCommand(args,parser,tracker,LastCommandComponent)
      components := components ++ result.components
      connections := connections ++ result.connections
      CommandComponent = result.components[0]
      connections.push({
        startNode: LastCommandComponent.id,
        startPort: \output,
        endNode: CommandComponent.id,
        endPort: \input
      }) if LastCommandComponent
      LastCommandComponent = CommandComponent
  {components,connections}




parseCommand = (command) -> parseAST generateAST(command)

parseComponent = (command) -> parserCommand[command.exec].parseComponent(command)

parser  <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent}
exports <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent,VisualSelectorOptions}
