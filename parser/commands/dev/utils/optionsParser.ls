
class Iterator
  (ArgList) ->
    @index = 0
    @argList = ArgList
    @length = ArgList.length
    @current = ArgList.0
  hasNext: -> @index != @length
  next: -> @current = @argList[@index++]
  rest: -> @argList.slice @index

parseShortOptions = (options,componentData,argsNodeIterator) ->
  {shortOptions} = options
  iter = new Iterator argsNodeIterator.current.slice(1)
  while option = iter.next!
    arg = shortOptions[option]
    break if arg and arg componentData,argsNodeIterator,iter


parseLongOptions = (options,componentData,argsNodeIterator) ->
  {longOptions} = options
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
switchOn = (...flags)->
  (Component) ->
    for flag in flags
      Component.flags[flag] = true
    false

/**
  set parameter (param)
  @returns a boolean indicating 
  that the rest of the argument was used 
*/
setParameter = (param) ->
  paramFn = (Component,state,substate) ->
    hasNext = substate.hasNext!
    parameter = if hasNext then substate.rest! else state.next!
    Component.parameters[param] = parameter
    true
  paramFn
    ..ptype = \param
    ..param = param


/**
  set the selector _key_ with the value _value_
*/
select = (key,value) ->
  (Component) !-> 
    Component.selectors[key] = value


selectParameter = (key,value) ->
  paramFn = (Component,state,substate)->
    parameselectParameterter = if substate.hasNext! then substate.rest! else state.next!
    Component.selectors[key] = [value,parameter]
    true
  paramFn
    ..ptype = \param
    ..param = param


selectIfUnselected = (key,value,...selections) ->
  (Component) !-> 
    selectorValue = Component.selectors[key]
    for selection in selections
      return false if selectorValue == selection
    Component.selectors[key] = value


sameAs = (option) -> [\same,option]

exports <<< {
  parseShortOptions
  parseLongOptions
  switchOn
  setParameter
  select
  selectParameter 
  selectIfUnselected
  sameAs
}