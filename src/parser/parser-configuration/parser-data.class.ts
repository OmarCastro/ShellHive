import { Dictionary, SelectorOptionInfo, Config, SelectorInfo, ParameterInfo, FlagInfo, ComponentSelector } from "./interfaces"

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


  public constructor(config:Config){
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
    const selectors      = this.selectors;
    const selectorOptions= this.selectorOptions;
    const visualSelectorOptions = this.visualSelectorOptions;
    const regexToReplace = / /g

    for (let key in selectorData) {
      const subkeys = selectorData[key];
      const keySelector = selectors[subkeys.name] = {};
      const keySelectorOption = selectorOptions[subkeys.name] = {};
      const VisualSelectorOption = visualSelectorOptions[subkeys.name] = [];

      for (let subkey in subkeys.options) {
        const value = subkeys.options[subkey];
        keySelector[value.name] = value;
        keySelectorOption[value.name] = value.option;
        VisualSelectorOption.push(value.name);  
      
      }
    }


    visualSelectorOptions.$selector = selectors
    return this;
  }  

  /**
    Sets the options for the normal options
    of a command, normally a one character option
  */
  //public setShortOptions(options){
  //  this.shortOptions = options
  //}

  /**
    Sets the options for the long variants of the options
    of a command, normally a an argument prefixed with 2
    hypens
  */
  //public setLongOptions(options){
  //  this.longOptions = options
  //}



  private entriesOf<T>(obj: Dictionary<T>): [string, T][]{
     return Object.keys(obj).map((key) => <[string, T]>[key, obj[key]])
  }

  public get componentFlags() : Dictionary<boolean>{
    const flags = this.flags
    return Object.keys(flags).reduce((map, key)=> {
      const value = flags[key]
      map[value.name] = value.active;
      return map
    }, {});
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