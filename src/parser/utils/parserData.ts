
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


export interface Config{
  selectors?:any
  flags?:any
  parameters?:any
  numericParameters?:any
  selectorsWithParameters?:any
}

import common = require("../commands/_init");

export class ParserData{
  
  public selectors: any = {}
  public selectorOptions:any  = {}
  public visualSelectorOptions: any = {}

  public shortOptions
  public longOptions
  
  public parameters
  
  public numericParameters

  public selectorsWithParameters

  public flags;
  public flagOptions;


  public constructor(config:Config = {}){
    this.setFlags(config.flags);
    this.parameters = config['parameters'] || {}
    this.numericParameters = config['numericParameters'] || {}
    this.selectorsWithParameters = config['selectorsWithParameters'] || {}
    if(config.selectors) this.setSelector(config['selectors']);

  }


  public setFlags(flags:any = {}){
    this.flags = flags
    var flagOptions = (this.flagOptions = {});
    var value;
    for (var key in flags) {
      flagOptions[value.name] = value.option
    }
  }


  /**
    Generates data to be used in selection tasks
  */
  public setSelector(selectorData:any = {}){
    if(Object.keys(this.selectors).length > 0){
      throw "you should not redefine the selectors multiple times";
      
    }
    var selectors      = this.selectors;
    var selectorOptions= this.selectorOptions;
    var visualSelectorOptions = this.visualSelectorOptions;
    var subkey:string;
    var key:string;
    var regexToReplace = / /g

    for (key in selectorData) {
      var subkeys = selectorData[key];
      var keySelector = selectors[key] = {};
      var keySelectorOption = selectorOptions[key] = {};
      var VisualSelectorOption = visualSelectorOptions[key] = [];
    
      for (subkey in subkeys) {
        var value = subkeys[subkey];
        keySelector[subkey.replace(regexToReplace,"_")] = subkey;
        keySelectorOption[subkey] = value;
        VisualSelectorOption.push(value);
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
}