
/**
  CompilerData gives information to be used
  to compile the AST to a data repersentation
  of a command

  There are 6 types of options
  
  simple string: 
      a simple argument, each command treats them differently
  selection:
      there exists a list of arguments that the command will choose
      one of them to use, if no selection argument is added the command uses the default one
  parameters:
      an argument that includes a parameter
  numeric paramters:
      an argument that includes a parameter that is limited to numbers
  selection with parameters:
      a selection argument which one or more of them is a parameter
  flags:
      a flag in the command
*/

export class ParserData{
  public selectorData:Dictionary<SelectorInfo>
  public selectors:Dictionary<Dictionary<SelectorOptionInfo> > = {}
  public selectorOptions:any = {}
  public visualSelectorOptions:any = {}

  public parameters:Dictionary<ParameterInfo>
  public parameterOptions:any = {}

  public shortOptions:any = {}
  public longOptions:any = {}

  public flags:Dictionary<FlagInfo>
  public flagOptions:any = {}


  public constructor(config:Config = {}){
    this.setFlags(config.flags);
    this.setParameters(config.parameters);
    this.setSelector(config.selectors);
  }


  private setFlags(flags:any = {}){
    this.flags = flags
    var flagOptions = (this.flagOptions = {});
    for (var key in flags) {
      var value = flags[key]
      flagOptions[value.name] = value.option
    }
  }

  private setParameters(parameters:any = {}){
    this.parameters = parameters
    var parameterOptions = this.parameterOptions;
    for (var key in parameters) {
      var value = parameters[key]
      parameterOptions[value.name] = value.option
    }
  }

  /**
    Generates data to be used in selection tasks
  */
  private setSelector(selectorData:Dictionary<SelectorInfo> = {}){
    this.selectorData = selectorData
    var selectors      = this.selectors;
    var selectorOptions= this.selectorOptions;
    var visualSelectorOptions = this.visualSelectorOptions;
    var regexToReplace = / /g

    for (var key in selectorData) {
      var subkeys = selectorData[key];
      var keySelector = selectors[subkeys.name] = {};
      var keySelectorOption = selectorOptions[subkeys.name] = {};
      var VisualSelectorOption = visualSelectorOptions[subkeys.name] = [];

      for (var subkey in subkeys.options) {
        var value = subkeys.options[subkey];
        keySelector[value.name] = value;
        keySelectorOption[value.name] = value.option;
        VisualSelectorOption.push(value.name);  
      
      }
    }


    visualSelectorOptions.$selector = selectors
    visualSelectorOptions.$changeToValue = function (currSelector, key ,value) {
      var toChange = selectors[key][value];
      currSelector.name = toChange.name
      currSelector.type = toChange.type
      if(currSelector.value && toChange.type === "option"){
        delete currSelector.value
      }
      else if(!currSelector.value && toChange.type !== "option" && toChange.defaultValue){
        currSelector.value = toChange.defaultValue
      }
    }
    return this;
  }  

  /**
    Sets the options for the normal options
    of a command, normally a one character option
  */
  public setShortOptions(options){
    this.shortOptions = options
  }

  /**
    Sets the options for the long variants of the options
    of a command, normally a an argument prefixed with 2
    hypens
  */
  public setLongOptions(options){
    this.longOptions = options
  }




  public get componentFlags() : Dictionary<boolean>{
    var componentFlags:Dictionary<boolean> = {}
    var flags = this.flags
    for (var key in flags) {
      var value = flags[key]
      componentFlags[value.name] = value.active
    }
    return componentFlags;
  }

  public get componentSelectors():Dictionary<ComponentSelector>{
    var componentSelectors:Dictionary<ComponentSelector> = {}
    var selectorData = this.selectorData    
    for (var key in selectorData) {
      var value = selectorData[key]
      for (var optionName in value.options){
        var option = value.options[optionName]
        if(option.default){
          var valueObj = {
            name:option.name,
            type:option.type || "option",
          }
          if(option.defaultValue){
            valueObj['value'] = option.defaultValue
          }
          componentSelectors[value.name] = valueObj
          break;
        }
      }
    }
    return componentSelectors;
  }

  public get componentParameters() : Dictionary<string> {
    var componentParameters: Dictionary<string> = {}
    var parameters = this.parameters
    for (var key in parameters) {
      var value = parameters[key]
      componentParameters[value.name] = value.defaultValue || ""
    }
    return componentParameters;
  }

}




export enum SelectorOptionType{
  OPTION,
  PARAMETER,
  NUMERIC_PARAMETER
}

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
  parameters?:any
}

export interface ComponentSelector{
  name:string;
  type:string;
  value?:any;
}