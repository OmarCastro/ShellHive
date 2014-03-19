parser = {}

astBuilder = require './ast-builder/ast-builder'

parserCommand =
  awk:       require './commands/awk'
  cat:       require './commands/cat'
  ls:        require './commands/ls'
  grep:      require './commands/grep'
  bunzip2:   require './commands/bunzip2'
  bzcat:     require './commands/bzcat'
  bzip2:     require './commands/bzip2'
  compress:  require './commands/compress'
  gzip:      require './commands/gzip'
  gunzip:    require './commands/gunzip'
  zcat:      require './commands/zcat'
  head:      require './commands/head'
  tail:      require './commands/tail'
  tr:        require './commands/tr'
  tee:       require './commands/tee'

implementedCommands = [key for key of parserCommand when key != \tee]

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

  head:     parserCommand.head.VisualSelectorOptions
  tail:     parserCommand.tail.VisualSelectorOptions
  compress: parserCommand.compress.VisualSelectorOptions
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


isImplemented = (command) -> parserCommand.command?







### =================  TEXT TO VISUAL DATA =================



/**
 * Parses the syntax of the command and
 * transforms into an Abstract Syntax Tree
 * @param command command
 * @return the resulting AST
 */
function generateAST(command)
  return astBuilder.parse(command)



/**
 * Parses the Abstract Syntax Tree
 * and transforms it to a graph representation format
 * that can be used in the visual application
 *
 * @param ast - the Abstract Syntax Tree
 * @param tracker - and tracker the tracks the id of a component
 * @returns the visual representation of the object
 */
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

  return {firstMainComponent,counter:tracker.id,components,connections}



/**
 * parses the command
 */
function parseCommand(command)
  return parseAST generateAST(command)




### =================  VISUAL DATA TO TEXT =================

/**
 * Creates an index of the components
 */
indexComponents = (visualData) -> {[comp.id,comp] for comp in visualData.components}


function parseVisualData(VisualData)
  return '' if VisualData.components.length < 1
  indexedComponentList = indexComponents(VisualData)
  initialComponent = indexedComponentList[VisualData.firstMainComponent]
  return if initialComponent is null
  parseVisualDatafromComponent(initialComponent,VisualData,indexedComponentList,{}) 


function parseComponent(component, visualData,componentIndex,mapOfParsedComponents)
  switch component.type
  | \command => parserCommand[component.exec].parseComponent(component,visualData,componentIndex,mapOfParsedComponents,parseVisualDatafromComponent)
  | \subgraph => ''
  | otherwise => '' 


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


### ==== Macros ====

createMacro = (name, description, fromMacro) ->
  if fromMacro
    macroData = JSON.parse(JSON.stringify(fromMacro))
      ..name = name
      ..description = description
  else
    macroData = {
      name: name
      description: description
      entryComponent: null
      exitComponent: null
      counter: 0
      components: []
      connections: []
    }

function compileMacro(macro)
  if macro.entryComponent is null 
    throw "no component defined as Macro Entry"
  if macro.exitComponent is null
    throw "no component defined as Macro Exit"
  indexedComponentList = indexComponents(macro)
  initialComponent = indexedComponentList[macro.entryComponent]
  parseVisualDatafromComponent(initialComponent,VisualData,indexedComponentList,{})



parser  <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent,implementedCommands, parseVisualData }
exports <<< {generateAST,parseAST,astBuilder,parseCommand, parseComponent,implementedCommands, parseVisualData, createMacro ,VisualSelectorOptions}
