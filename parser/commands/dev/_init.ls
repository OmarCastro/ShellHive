
exports.Iterator = class Iterator
  (ArgList) ->
    @index = 0
    @argList = ArgList
    @length = ArgList.length
    @current = ArgList.0
  hasNext: -> @index == @length
  next: -> @current = @argList[@index++]
  rest: -> @argList.slice @index



exports.parseShortOptions = (shortOptions,componentData,argsNodeIterator) ->
  iter = new Iterator argsNodeIterator.current.slice(1)
  while option = iter.next!
    arg = shortOptions[option]
    break if arg and arg componentData,argsNodeIterator,iter


exports.parseLongOptions = (longOptions,componentData,argsNodeIterator) ->
  arg = optionsParser.longOptions[argNode.slice(2)];
  arg componentData if arg

/**
  enables flags ()
  @returns a boolean indicating 
  that the rest of the argument was used 
*/
exports.switchOn = ->
  args = arguments;
  (Component) ->
    for flag in args
      Component.flags[flag] = true
    false

/**
  enables flags ()
  @returns a boolean indicating 
  that the rest of the argument was used 
*/
exports.setParameter  = (param) ->
  (Component,state,substate) ->
    Component.parameters[param] = if   substate.hasNext! 
                                  then substate.rest!
                                  else state.next!
    true

exports.select = (key,value) -> (Component) !-> Component.selectors[key] = value

exports.selectIfUnselected = (key,value,...selections) -> (Component) -> 
  selectorValue = Component.selectors[key]
  for selection in selections
    return if selectorValue == selection
  Component.selectors[key] = value


exports.sameAs = (option) -> [\same,option]


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
exports.typeOf = (arg) !->
  if typeof arg == \string
    if arg[0] == \-
      return \longOption if arg[1] == \-
      return \shortOptions
    else return \string
  if arg instanceof Array
    return arg[0]

#simply accepts the argument since it does nothing
exports.justAccept = -> -> 


exports.generate = (parser) -> 
    {longOptions,shortOptions} = parser
    for key, val of longOptions
      longOptions[key] = shortOptions[val[1]] if val[0] == \same
