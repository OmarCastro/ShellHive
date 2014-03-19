(function(){
  var Iterator, parseShortOptions, parseLongOptions, switchOn, setParameter, select, selectParameter, selectIfUnselected, sameAs, slice$ = [].slice;
  Iterator = (function(){
    Iterator.displayName = 'Iterator';
    var prototype = Iterator.prototype, constructor = Iterator;
    function Iterator(ArgList){
      this.index = 0;
      this.argList = ArgList;
      this.length = ArgList.length;
      this.current = ArgList[0];
    }
    prototype.hasNext = function(){
      return this.index !== this.length;
    };
    prototype.next = function(){
      return this.current = this.argList[this.index++];
    };
    prototype.rest = function(){
      return this.argList.slice(this.index);
    };
    return Iterator;
  }());
  parseShortOptions = function(options, componentData, argsNodeIterator){
    var shortOptions, iter, option, arg, results$ = [];
    shortOptions = options.shortOptions;
    iter = new Iterator(argsNodeIterator.current.slice(1));
    while (option = iter.next()) {
      arg = shortOptions[option];
      if (arg && arg(componentData, argsNodeIterator, iter)) {
        break;
      }
    }
    return results$;
  };
  parseLongOptions = function(options, componentData, argsNodeIterator){
    var longOptions, optionStr, indexOfSep, x$, iter, optionKey, arg;
    longOptions = options.longOptions;
    optionStr = argsNodeIterator.current.slice(2);
    indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
      x$ = iter = new Iterator(optionStr);
      x$.index = indexOfSep + 1;
      optionKey = optionStr.slice(0, indexOfSep);
      arg = longOptions[optionKey];
      if (!arg) {
        arg = longOptions[optionStr];
      }
      if (arg) {
        return arg(componentData, argsNodeIterator, iter);
      }
    } else {
      arg = longOptions[optionStr];
      if (arg) {
        return arg(componentData);
      }
    }
  };
  /**
    enables flags (flags)
    @returns a boolean indicating 
    that the rest of the argument was used 
  */
  switchOn = function(){
    var flags;
    flags = slice$.call(arguments);
    return function(Component){
      var i$, ref$, len$, flag;
      for (i$ = 0, len$ = (ref$ = flags).length; i$ < len$; ++i$) {
        flag = ref$[i$];
        Component.flags[flag] = true;
      }
      return false;
    };
  };
  /**
    set parameter (param)
    @returns a boolean indicating 
    that the rest of the argument was used 
  */
  setParameter = function(param){
    var paramFn, x$;
    paramFn = function(Component, state, substate){
      var hasNext, parameter;
      hasNext = substate.hasNext();
      parameter = hasNext
        ? substate.rest()
        : state.next();
      Component.parameters[param] = parameter;
      return true;
    };
    x$ = paramFn;
    x$.ptype = 'param';
    x$.param = param;
    return x$;
  };
  /**
    set the selector _key_ with the value _value_
  */
  select = function(key, value){
    return function(Component){
      Component.selectors[key] = value;
    };
  };
  selectParameter = function(key, value){
    var paramFn, x$;
    paramFn = function(Component, state, substate){
      var parameselectParameterter;
      parameselectParameterter = substate.hasNext()
        ? substate.rest()
        : state.next();
      Component.selectors[key] = [value, parameter];
      return true;
    };
    x$ = paramFn;
    x$.ptype = 'param';
    x$.param = param;
    return x$;
  };
  selectIfUnselected = function(key, value){
    var selections;
    selections = slice$.call(arguments, 2);
    return function(Component){
      var selectorValue, i$, ref$, len$, selection;
      selectorValue = Component.selectors[key];
      for (i$ = 0, len$ = (ref$ = selections).length; i$ < len$; ++i$) {
        selection = ref$[i$];
        if (selectorValue === selection) {
          return false;
        }
      }
      Component.selectors[key] = value;
    };
  };
  sameAs = function(option){
    return ['same', option];
  };
  exports.parseShortOptions = parseShortOptions;
  exports.parseLongOptions = parseLongOptions;
  exports.switchOn = switchOn;
  exports.setParameter = setParameter;
  exports.select = select;
  exports.selectParameter = selectParameter;
  exports.selectIfUnselected = selectIfUnselected;
  exports.sameAs = sameAs;
}).call(this);
