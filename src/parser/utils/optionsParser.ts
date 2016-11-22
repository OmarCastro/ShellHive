
import { Iterator } from "./iterator.class"
export { parseShortOptions } from "./short-options-parser.namesapce"

export const parseLongOptions = function(options, componentData, argsNodeIterator){
    const longOptions = options.longOptions;
    const optionStr = argsNodeIterator.current.slice(2);
    const indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
      const iter = new Iterator(optionStr);
      iter.index = indexOfSep + 1;
      const optionKey = optionStr.slice(0, indexOfSep);
      const arg = longOptions[optionKey] || longOptions[optionStr];
      if (arg) {
        return arg(componentData, argsNodeIterator, iter);
      }
    } else {
      const arg = longOptions[optionStr];
      if (arg) {
        return arg(componentData);
      }
    }
  };
  /**
    activates flags (flags)
  */
export const switchOn = function(...flags:any[]){
    flags = flags.map(flag => {return (flag.name) ? flag.name : flag});
    return function(Component, state, substate){
      flags.forEach(flag => {Component.flags[flag] = true});
      return false;
    };
  };
  /**
    set parameter (param)
  */
export const setParameter = function(param){
    const paramFn: any = function(Component, state, substate){
      const hasNext = substate.hasNext();
      const parameter = hasNext
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
export function select(key:{name:string}, value:{name:string}, type?:string);
export function select(key:string, value:string, type?:string);
export function select(key:any, value:any, type:string = "option"){
  if(key.name){key = key.name}
  if(value.name){value = value.name}
  if(type == "option"){
    return function(Component){
      Component.selectors[key] = {
        type:type,
        name:value
      }
    }
  } else if(type == "numeric parameter"){
    return function(Component, state, substate){
      var parameter = substate.hasNext()
        ? substate.rest()
        : state.next();
      Component.selectors[key] = {
        type:type,
        name:value,
        value: +parameter
      }
    }
  }
};

export var selectIfUnselected = function(key, value, ...selections:any[]){
  if(key.name){key = key.name}
  if(value.name){value = value.name}
  selections = selections.map(val => val.name || val);
  return function(Component){
    var selectorValue = Component.selectors[key].name;
    if(selections.every(value => { return selectorValue !== value } )){
      Component.selectors[key] = {
        type:"option",
        name:value
      };
    }
  }
};


/**
  function to ignore errors when using this option
*/
export function ignore(){};

export var sameAs = function(option){ return ['same', option] }

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
      opt = select(selector,option, option.type);
      if(option.option){
        if(option.option[0] === "-"){
          longOptions[option.option.slice(2)] = opt;
        } else {
          shortOptions[option.option] = opt;
        }
      }
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