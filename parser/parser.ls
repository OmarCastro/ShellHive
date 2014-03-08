parser = {}

astBuilder = require './ast-builder/ast-builder'

parserCommand =
  awk:       require './commands/v/awk'
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
  tee:       require './commands/v/tee'

implementedCommands = [key for key of parserCommand when key != \tee]

function isImplemented(command)
  return !!parserCommand(command)

VisualSelectorOptions = 
  cat:      parserCommand.cat.VisualSelectorOptions
  grep:     parserCommand.grep.VisualSelectorOptions
  ls:       parserCommand.ls.VisualSelectorOptions

  bunzip2:  parserCommand.gzip.VisualSelectorOptions
  bzcat:    parserCommand.gzip.VisualSelectorOptions
  bzip2:    parserCommand.gzip.VisualSelectorOptions

  gzip:     parserCommand.gzip.VisualSelectorOptions
  gunzip:   parserCommand.gzip.VisualSelectorOptions
  zcat:     parserCommand.gzip.VisualSelectorOptions

function getPositionBoundaries(components)
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
  return {xs,ys,xe,ye}

function generateAST(command)
  return astBuilder.parse(command)

function parseAST(ast, tracker)
  components = []
  connections = []
  firstMainComponent: null
  LastCommandComponent = null # commponent in previous commanf
  CommandComponent = null     # component in command
  tracker ?= {id: 0, x:0, y:0}
  for commandNode,index in ast
    {exec,args} = commandNode
    nodeParser = parserCommand[exec]
    if nodeParser.parseCommand
      return nodeParser.parseCommand args, parser, tracker, LastCommandComponent, ast.slice(index+1), firstMainComponent, components, connections if exec is \tee
      result_aux = nodeParser.parseCommand args, parser, tracker, LastCommandComponent
      
      result = null
      if result_aux instanceof Array
        result = result_aux[1]
      else
        result = result_aux
      
      components := components ++ result.components
      connections := connections ++ result.connections
      CommandComponent = result.mainComponent
      if LastCommandComponent  
        comp =  if LastCommandComponent instanceof Array
                then LastCommandComponent.1
                else LastCommandComponent
        connections.push({
          startNode: comp.id,
          startPort: \output,
          endNode: CommandComponent.id,
          endPort: \input
        })       
      if result_aux instanceof Array
        LastCommandComponent = [result_aux.0,CommandComponent]
      else
        LastCommandComponent = CommandComponent
      "mi" if CommandComponent is void
      firstMainComponent = CommandComponent.id if index < 1

  return {firstMainComponent,components,connections}


function parseCommand(command)
  return parseAST generateAST(command)

function parseComponent(component, visualData,componentIndex,mapOfParsedComponents)
  return parserCommand[component.exec].parseComponent(component,visualData,componentIndex,mapOfParsedComponents,parseVisualDatafromComponent)

indexComponents = (visualData) -> {[comp.id,comp] for comp in visualData.components}


function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents)
  commands = []
  do
    isFirst = true
    for connection in visualData.connections 
    when connection.endNode == currentComponent.id
    and connection.startPort == \output 
    and connection.endPort == \input
    and mapOfParsedComponents[connection.startNode] != true
      isFirst = false
      currentComponent = componentIndex[connection.startNode]
      break
  while isFirst = false
  commands.push parseComponent(currentComponent,visualData,componentIndex,mapOfParsedComponents)

  outputs = for connection in visualData.connections 
    when connection.startNode == currentComponent.id 
    and connection.startPort == \output
    and mapOfParsedComponents[connection.endNode] != true
      endNodeId = connection.endNode;
      for component in visualData.components when component.id == endNodeId 
        endNode = component
        break
      endNode

  nextcommands = [parseVisualDatafromComponent(component,visualData,componentIndex,mapOfParsedComponents) for component in outputs]

  if nextcommands.length > 1
    comm = "tee"
    for i from 0 to nextcommands.length - 2
      comm += " >(#{nextcommands[i]})"
    commands.push comm
    commands.push nextcommands[*-1]
  else if nextcommands.length == 1
    commands.push nextcommands.0

  return commands * " | "


function parseVisualData(VisualData)
  indexedComponentList = indexComponents(VisualData)
  initialComponent = indexedComponentList[VisualData.firstMainComponent]
  return if initialComponent is null
  parseVisualDatafromComponent(initialComponent,VisualData,indexedComponentList,{}) 


parser  <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent,implementedCommands, parseVisualData }
exports <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent,implementedCommands, parseVisualData, VisualSelectorOptions}
