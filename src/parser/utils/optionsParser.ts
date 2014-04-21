
class Iterator{
  public index:number = 0;
  public argList:any[];
  public length:number;
  public current:any;

  public constructor(ArgList:any[]){
    this.argList = ArgList;
    this.length = ArgList.length;
    this.current = ArgList[0];
  }

  public hasNext(){ return this.index !== this.length }
  public next(){return this.current = this.argList[this.index++] }
  public rest(){return this.argList.slice(this.index) }
}

export function parseShortOptions(options,componentData,argsNodeIterator){
  var option,
      shortOptions = options.shortOptions,
      iter = new Iterator(argsNodeIterator.current.slice(1))
  while(option = iter.next()){
    var arg = shortOptions[option]
    if(arg && arg(componentData,argsNodeIterator,iter)){ break }
  }
}

export var parseLongOptions = function(options, componentData, argsNodeIterator){
    var longOptions, optionStr, indexOfSep, iter, optionKey, arg;
    longOptions = options.longOptions;
    optionStr = argsNodeIterator.current.slice(2);
    indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
      iter = new Iterator(optionStr);
      iter.index = indexOfSep + 1;
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
    activates flags (flags)
  */
export var switchOn = function(...flags:any[]){
    flags = flags.map(flag => {return (flag.name) ? flag.name : flag});
    return function(Component, state, substate){
      flags.forEach(flag => {Component.flags[flag] = true});
      return false;
    };
  };
  /**
    set parameter (param)
  */
export var setParameter = function(param){
    var paramFn:any = function(Component, state, substate){
      var hasNext, parameter;
      hasNext = substate.hasNext();
      parameter = hasNext
        ? substate.rest()
        : state.next();
      Component.parameters[param] = parameter;
      return true;
    };
    paramFn
    paramFn.ptype = 'param';
    paramFn.param = param;
    return paramFn
  };
/**
  set the selector _key_ with the value _value_
*/
export function select(key:{name:string}, value:{name:string});
export function select(key:string, value:string);
export function select(key:any, value:any){
    if(key.name){key = key.name}
    if(value.name){value = value.name}
    return function(Component){
      Component.selectors[key] = {
        type:"option",
        name:value
      }
    };
  };

/**
  function to ignore errors when using this option
*/
export function ignore(){};


export var selectParameter = function(key:string, value:string){
    var paramFn:any = function(Component, state, substate){
      var parameselectParameterter;
      parameselectParameterter = substate.hasNext()
        ? substate.rest()
        : state.next();
      Component.selectors[key] = {
        parameterName: value,
        parameterValue: parameselectParameterter
      };
      return true;
    };
    paramFn
    paramFn.ptype = 'param'
    return paramFn;
  };

export var selectIfUnselected = function(key, value, ...selections:any[]){
  return function(Component){
    var selectorValue = Component.selectors[key];
    if(selections.every(value => { return selectorValue !== value } )){
      Component.selectors[key] = value;
    } else {
      return false
    }
  }
};

export var sameAs = function(option){ return ['same', option] }


export function generateSelectors(options){
  var selectors:any = {};
  var selectorType:any = {};
  var selectorOptions:any = {};
  var VisualSelectorOptions:any = {};
  var subkey:string;
  var key:string;
  var subkeys:{[s:string]:any};
  for (key in options) {
    subkeys = options[key];
    selectors[key] = key;
    var keySelectorType = selectorType[key] = {};
    var keySelectorOption = selectorOptions[key] = {};
    var VisualSelectorOption = VisualSelectorOptions[key] = [];
    for (subkey in subkeys) {
      var value = subkeys[subkey];
      keySelectorType[subkey.replace(" ","_")] = subkey;
      keySelectorOption[subkey] = value;
      VisualSelectorOption.push(value);
    }
  }
  return {
    selectors: selectors,
    selectorType: selectorType,
    selectorOptions: selectorOptions,
    VisualSelectorOptions: VisualSelectorOptions
  };
};

export function generate(parser){
  var key, val
  var longOptions = parser.longOptions,
      shortOptions = parser.shortOptions;
  for (key in longOptions) {
    val = longOptions[key];
    if (val[0] === 'same') {
      longOptions[key] = shortOptions[val[1]]
    }
  }
}

export function optionParserFromConfig(config){
  var longOptions:any = {}
  var shortOptions:any = {}
  var opt:any

  for(var key in config.flags || {}){
    var flag = config.flags[key];
    opt = switchOn(flag);
    shortOptions[flag.option] = opt;
    if(flag.longOption){
      if(flag.longOption instanceof Array){
        flag.longOption.forEach(option => longOptions[option] = opt)
      } else {
        longOptions[flag.longOption] = opt
      }
    }
  }
  for(var key in config.selectors || {}){
    var selector = config.selectors[key];
    var options = selector.options;
    for(var optionkey in options){
      var option = options[optionkey];
      opt = select(selector,option);
      shortOptions[option.option] = opt;
      if(option.longOption){
        if(option.longOption instanceof Array){
          option.longOption.forEach(option => longOptions[option] = opt)
        } else {
          longOptions[option.longOption] = opt
        }
      }
    }
  }


  return {
    longOptions:longOptions,
    shortOptions:shortOptions
  }
}