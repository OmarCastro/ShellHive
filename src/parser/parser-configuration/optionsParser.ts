
import { Iterator } from "../utils/iterator.class"
import { optionsConfig, Config } from "./interfaces"

export { parseShortOptions } from "./short-options.namesapce"
export { parseLongOptions } from "./long-options.namesapce"
export { setParameter } from "./parameters.fn"
import { activateFlags } from "./flags"
import { CommandComponent } from "../../graph/component/command-component.class"

export interface ParseFunction{
  (component: CommandComponent, state, substate) : any;
}


  /**
    activates flags (flags)
  */
export const switchOn = activateFlags;


/**
  set the selector _key_ with the value _value_
*/
export function select(key:{name:string}, value:{name:string}, type?:string);
export function select(key:string, value:string, type?:string);
export function select(key:any, value:any, type:string = "option"): ParseFunction{
  if(key.name){ key = key.name }
  if(value.name){ value = value.name }
  if(type == "option"){
    return (Component) => {
      Component.selectors[key] = {
        type:type,
        name:value
      }
    }
  } else if(type == "numeric parameter"){
    return (Component, state, substate) => {
      const parameter = substate.hasNext() ? substate.rest() : state.next();
      Component.selectors[key] = {
        type:type,
        name:value,
        value: +parameter
      }
    }
  }
};

export var selectIfUnselected = function(key, value, ...selections:any[]): ParseFunction{
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
export function ignore(): ParseFunction{return function(){}};

export function optionParserFromConfig(config: Config): optionsConfig{
  const longOptions:any = {}
  const shortOptions:any = {}
  let opt:ParseFunction

  for(const key in config.flags || {}){
    const flag = config.flags[key];
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
  for(const key in config.selectors || {}){
    const selector = config.selectors[key];
    const options = selector.options;
    for(const optionkey in options){
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