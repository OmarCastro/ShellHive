
Boundaries = require("./_graphlayout");
ComponentConnections = require("../utils/componentConnections")
optionsParser = require("../utils/optionsParser")



exports.Iterator = class Iterator
  (ArgList) ->
    @index = 0
    @argList = ArgList
    @length = ArgList.length
    @current = ArgList.0
  hasNext: -> @index != @length
  next: -> @current = @argList[@index++]
  rest: -> @argList.slice @index

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
function typeOf(arg)
  if typeof arg == \string && arg.length > 0
    if arg[0] == \- && arg.length > 1
      return \longOption if arg[1] == \-
      return \shortOptions
    else return \string
  if arg instanceof Array
    return arg[0]

#simply accepts the argument since it does nothing
justAccept = -> -> 


function generate(parser) 
    {longOptions,shortOptions} = parser
    for key, val of longOptions
      longOptions[key] = shortOptions[val[1]] if val[0] == \same



getComponentById = (visualData,id) !->
  for x in visualData.components when x.id == id
    return x
  return null

addFileComponent = (options, filename) ->
  {componentData,connectionsToPush,tracker} = options
  componentData.files.push(argNode)
  newComponent = {
    type: \file
    filename: argNode
    id: tracker.id
    position: {x:0,y:0}
  }
  connectionsToPush.push {
    startNode: tracker.id,
    startPort: \output,
    endPort: "file#{componentData.files.length - 1}"
  }

commonNodeParsing = {
  string: (options) -> addFileComponent(options,options.iterator.current)
  shortOptions: (options) -> addFileComponent(options,options.iterator.current)
  longOption: (options) -> addFileComponent(options,options.iterator.current)
}




commonParseCommand = (optionsParserData,defaultComponentData, argNodeParsing) ->
  (argsNode, parser, tracker, previousCommand) ->
    componentData = defaultComponentData!
    boundaries = []
    if previousCommand
      if previousCommand instanceof Array
        boundaries.push previousCommand.0
      else
        boundaries.push[Boundaries.getBoundaries([previousCommand])]
    connections = new ComponentConnections(componentData)
    stdoutRedirection = null
    stderrRedirection = null

    result = {components:[componentData],connections:[],mainComponent: componentData}
    iter = new Iterator argsNode
    while argNode = iter.next!
      switch typeOf argNode
      case \shortOptions
        optionsParser.parseShortOptions(optionsParserData,componentData,iter)
      case \longOption
        optionsParser.parseLongOptions(optionsParserData,componentData,iter)
      case \string
        if argNodeParsing && argNodeParsing.string
          argNodeParsing.string(componentData,argNode)
        else
          newComponent = {
            type: \file
            filename: argNode
            id: tracker.id
            position: {x:0,y:0}
          }
          inputPort = "file#{componentData.files.length}"
          componentData.files.push(argNode)
          connections.addConnectionToInputPort inputPort, {id:tracker.id, port:\output}
          tracker.id++
          result.components.push newComponent
          boundaries.push Boundaries.getBoundaries [newComponent]

      case \inFromProcess
        subresult = parser.parseAST(argNode[1], tracker)
        boundaries.push Boundaries.getBoundaries subresult.components
        result
          ..components  ++= subresult.components
          ..connections ++= subresult.connections
        inputPort = "file#{componentData.files.length}"
        connections.addConnectionToInputPort inputPort, {id:tracker.id-1, port:\output}
        componentData.files.push(["pipe",tracker.id-1]);

      case \outTo
        newComponent = {
          type: \file
          filename: argNode[1]
          id: tracker.id
          position: {x:0,y:0}
        }
        connections.addConnectionFromOutputPort {id:tracker.id, port:\input}
        tracker.id++
        result.components.push newComponent
        stdoutRedirection = newComponent
      case \errTo
        console.log \errTo!!
        newComponent = {
          type: \file
          filename: argNode[1]
          id: tracker.id
          position: {x:0,y:0}
        }
        connections.addConnectionFromErrorPort {id:tracker.id, port: \input}
        tracker.id++
        result.components.push newComponent
        stderrRedirection = newComponent

      
    bbox = Boundaries.arrangeLayout(boundaries)
    
    componentData
      ..position = bbox[1]
      ..id = tracker.id
    if stdoutRedirection
      stdoutRedirection.position = bbox[1] with {x:bbox[1].x + 400}
    if stderrRedirection
      y = if stdoutRedirection then 100 else 0
      stderrRedirection.position = {x:bbox[1].x + 400, y: bbox[1].y + y}

    result.connections ++= connections.toConnectionList()
    tracker.id++ 
    [bbox.0,result]

parseFlagsAndSelectors = (component, options) -> 
    {flagOptions,selectorOptions} = options
    sFlags = [] #short flags (1 char flag)
    lFlags = [] #long flags (string flag starting with with "--")
    for key, value of component.flags when value
      flag = flagOptions[key]
      if flag[0] != \-
      then  sFlags.push flag
      else  lFlags.push flag

    if component.selectors
      for key, value of component.selectors when selectorOptions[key][value]?
        val = that
        if val[0] != \- 
        then  sFlags.push val
        else  lFlags.push val

    if sFlags.length > 0
      sFlags = "-" + sFlags * ''
    if lFlags.length > 0
      sFlags += " " if lFlags.length > 0
      sFlags += lFlags * ' '
    sFlags



commonParseComponent = (flagOptions, selectorOptions, parameterOptions, beforeJoin) ->
  options = {flagOptions, selectorOptions, parameterOptions}
  (component,visualData,componentIndex,mapOfParsedComponents,parseComponent) ->
    exec = [component.exec]

    mapOfParsedComponents[component.id] = true

    flags = parseFlagsAndSelectors component, options

    parameters = for key, value of component.parameters when value
      if value.indexOf(" ") >= 0 
      then "\"-#{parameterOptions[key]}#value\""
      else "-#{parameterOptions[key]}#value"

    files = for file in component.files
      if file instanceof Array
        subCommand = parseComponent(componentIndex[file.1],visualData,componentIndex,mapOfParsedComponents)
        "<(#subCommand)"
      else if file.indexOf(" ") >= 0 
           then "\"#file\""
           else file

    parameters = parameters * ' ' if parameters.length > 0
    if beforeJoin 
    then beforeJoin(component,exec,flags,files,parameters)
    else (exec ++ flags ++ parameters ++ files) * ' '

exports <<< optionsParser
exports <<< Boundaries
exports <<< {
  typeOf
  justAccept
  generate
  commonParseCommand
  commonParseComponent
  getComponentById
}