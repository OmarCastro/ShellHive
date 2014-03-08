
exports.Iterator = class Iterator
  (ArgList) ->
    @index = 0
    @argList = ArgList
    @length = ArgList.length
    @current = ArgList.0
  hasNext: -> @index != @length
  next: -> @current = @argList[@index++]
  rest: -> @argList.slice @index

function getBoundaries(components)
  return null if components.length == 0
  firstPos = components[0].position
  boundary =
    left  : firstPos.x
    rigth : firstPos.x
    top   : firstPos.y
    bottom: firstPos.y
    components: components
  for i from 1 to components.length - 1
    pos = components[i].position
    boundary
      ..left   = pos.x if pos.x < boundary.left
      ..rigth  = pos.x if pos.x > boundary.rigth
      ..top    = pos.y if pos.y < boundary.top
      ..bottom = pos.y if pos.y > boundary.bottom
  return boundary


function translateBoundary(boundary,x,y = 0)
  boundary
    ..left   += x
    ..rigth  += x
    ..top    += y
    ..bottom += y
  for comp in boundary.components
    comp.position
      ..x += x
      ..y += y

function arrangeLayout(boundaries)
  maxX = 0
  prevBound = null
  components = []
  for boundary in boundaries when boundary
    maxX = boundary.rigth if maxX < boundary.rigth
    components = components ++ boundary.components
  for boundary in boundaries when boundary
    translateBoundary boundary, maxX - boundary.rigth, 
      if prevBound then prevBound.bottom + 350 - boundary.top else 0
    prevBound = boundary
  x = switch boundaries.length
    | 0 => 0
    | _ => maxX + 450
  y = switch boundaries.length
    | 0 => 0
    | 1 => prevBound.bottom
    | _ => (prevBound.bottom)

  return [{left:0,rigth:x ,top:0 ,bottom:y,components},{x,y:y/2}]




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
        boundaries.push[getBoundaries([previousCommand])]
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
        boundaries.push getBoundaries subresult.components
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
      
    bbox = arrangeLayout(boundaries)
    componentData
      ..position = bbox[1]
      ..id = tracker.id


    for c in connectionsToPush
      result.connections.push({startNode:c.startNode, startPort:c.startPort
        ,endNode: tracker.id,endPort:c.endPort}) 

    tracker.id++ 
    [bbox.0,result]

commonParseComponent = (flagOptions, selectorsOptions) ->
  (componentData,visualData,componentIndex,mapOfParsedComponents,parseComponent) ->
    exec = [componentData.exec]
    mapOfParsedComponents[componentData.id] = true

    flags = []
    longflags = []
    for key, value of componentData.flags when value
      flag = flagOptions[key]
      if flag[0] != \-
      then  flags.push flag
      else  longflags.push flag

    for key, value of componentData.selectors when selectorsOptions[key][value]?
      val = that
      if val[0] != \- 
      then flags.push val 
      else longflags.push val

    flags = flags * ''
    flags = "-" + flags * '' if flags.length > 0
    if longflags.length > 0
      flags += " " if flags.length > 0
      flags += longflags * ' '
    files = for file in componentData.files
      if file instanceof Array
        subCommand = parseComponent(componentIndex[file.1],visualData,componentIndex,mapOfParsedComponents)
        "<(#subCommand)"
      else if file.indexOf(" ") >= 0 then "\"#file\"" else file
    (exec ++ flags ++ files) * ' '


exports <<< {
  getBoundaries
  arrangeLayout
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
  translateBoundary
  getComponentById
}