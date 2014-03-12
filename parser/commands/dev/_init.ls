
Boundaries = require("./_graphlayout.js");


exports.Iterator = class Iterator
  (ArgList) ->
    @index = 0
    @argList = ArgList
    @length = ArgList.length
    @current = ArgList.0
  hasNext: -> @index != @length
  next: -> @current = @argList[@index++]
  rest: -> @argList.slice @index

function parseShortOptions(shortOptions,componentData,argsNodeIterator)
  iter = new Iterator argsNodeIterator.current.slice(1)
  while option = iter.next!
    arg = shortOptions[option]
    break if arg and arg componentData,argsNodeIterator,iter


function parseLongOptions(longOptions,componentData,argsNodeIterator)
  optionStr = argsNodeIterator.current.slice(2);
  indexOfSep = optionStr.indexOf \=
  if indexOfSep > -1
    iter = new Iterator(optionStr)
      ..index = indexOfSep + 1
    optionKey = optionStr.slice 0,indexOfSep
    arg = longOptions[optionKey];
    arg = longOptions[optionStr] if !arg
    arg componentData, argsNodeIterator, iter if arg
  else
    arg = longOptions[optionStr];
    arg componentData if arg

/**
  enables flags (flags)
  @returns a boolean indicating 
  that the rest of the argument was used 
*/
function switchOn (...flags)
  return (Component) ->
    for flag in flags
      Component.flags[flag] = true
    false

/**
  set parameter (param)
  @returns a boolean indicating 
  that the rest of the argument was used 
*/
function setParameter (param)
  paramFn = (Component,state,substate) ->
    hasNext = substate.hasNext!
    parameter = if hasNext then substate.rest! else state.next!
    Component.parameters[param] = parameter
    true
  paramFn.ptype = \param
  paramFn.param = param
  return paramFn


/**
  set the selector _key_ with the value _value_
*/
function select(key,value)
  return (Component) !-> 
    Component.selectors[key] = value


function selectParameter(key,value)
  paramFn = (Component,state,substate)->
    parameselectParameterter = if substate.hasNext! then substate.rest! else state.next!
    Component.selectors[key] = [value,parameter]
    true
  paramFn.ptype = \param
  paramFn.param = param
  paramFn


function selectIfUnselected(key,value,...selections)
  return (Component) !-> 
    selectorValue = Component.selectors[key]
    for selection in selections
      return false if selectorValue == selection
    Component.selectors[key] = value


function sameAs(option)
  return [\same,option]


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



commonParseCommand = (optionsParser,defaultComponentData, argNodeParsing) ->
  (argsNode, parser, tracker, previousCommand) ->
    componentData = defaultComponentData!
    boundaries = []
    if previousCommand
      if previousCommand instanceof Array
        boundaries.push previousCommand.0
      else
        boundaries.push[Boundaries.getBoundaries([previousCommand])]
    connectionsToPush = []

    result = {components:[componentData],connections:[],mainComponent: componentData}
    iter = new Iterator argsNode
    while argNode = iter.next!
      switch typeOf argNode
      case \shortOptions
        parseShortOptions(optionsParser.shortOptions,componentData,iter)
      case \longOption
        parseLongOptions(optionsParser.longOptions,componentData,iter)
      case \string
        if argNodeParsing && argNodeParsing.string
          argNodeParsing.string(componentData,argNode)
        else 
          componentData.files.push(argNode)

      case \inFromProcess
        subresult = parser.parseAST(argNode[1], tracker)
        boundaries.push Boundaries.getBoundaries subresult.components
        for sub in subresult.components
          result.components.push sub
        for sub in subresult.connections
          result.connections.push sub
        componentData.files.push(["pipe",tracker.id-1]);
        connectionsToPush.push {
          startNode: tracker.id-1,
          startPort: \output,
          endPort: "file#{componentData.files.length - 1}"
        }
      
    bbox = Boundaries.arrangeLayout(boundaries)
    componentData
      ..position = bbox[1]
      ..id = tracker.id


    for c in connectionsToPush
      result.connections.push({startNode:c.startNode, startPort:c.startPort
        ,endNode: tracker.id,endPort:c.endPort}) 

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

    parameters = for key, value of component.parameters
          if value
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


exports <<< {
  Boundaries.getBoundaries
  Boundaries.arrangeLayout
  parseShortOptions
  parseLongOptions
  switchOn
  setParameter
  select
  selectIfUnselected
  sameAs
  typeOf
  justAccept
  generate
  commonParseCommand
  commonParseComponent
  Boundaries.translateBoundary
  getComponentById
}