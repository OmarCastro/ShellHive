import { ParseFunction } from "./optionsParser"

export interface Dictionary<T>{
  [s:string]:T
}

export interface SelectorOptionInfo{
 name:string;
 type:string
 option:string;
 description:string;
 default?:boolean;
 defaultValue?:any;
}

export interface FlagInfo{
  name:string;
  option:string;
  description:string;
  active:boolean;
}

export interface ParameterInfo{
  name:string;
  option:string;
  description:string;
  type:string;
  defaultValue:string;
}

export interface SelectorInfo{
  name:string;
  description:string;
  options: Dictionary<SelectorOptionInfo>
}

export interface Config{
  selectors?:any
  flags?:any
  parameters?: { [s:string]: ParameterInfo }
}

export interface ComponentSelector{
  name:string;
  type:string;
  value?:any;
}

export interface optionsConfig {
  shortOptions:{ [s:string]: ParseFunction },
  longOptions:{ [s:string]: ParseFunction }
}



