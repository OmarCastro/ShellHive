
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/



import {ICommandParser, ParserData, Config, $, CommandComponent, common, sanitizer}  from "./_common.imports";


const parameters = {
  separator:{
      name:'field separator',
      option: 'F',
      type: "string",
      description:"filter entries by anything other than the content",
      defaultValue: "",
    }
}

var config: Config = {
  parameters: parameters
}
var awkData = new ParserData(config);


var optionsParser = { 
  shortOptions:{
    F : $.setParameter(parameters.separator)
  },
  longOptions:{
    "field-separator" : $.setParameter(parameters.separator)
  }
}




export class AwkComponent extends CommandComponent {
  public exec:string = "awk"
  public script:string = ""
  public files: any[] = []
}


function defaultComponentData(){
  var component = new AwkComponent();
  component.parameters = awkData.componentParameters  
  return component;
};

export var commandParser : ICommandParser = {
  parseCommand: common.commonParseCommand(optionsParser,defaultComponentData,{ string: (component:AwkComponent, str) => {
      component.script = str;
    }
  }),
  parseComponent: common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions,awkData.parameterOptions, 
  (component,exec,flags,files,parameters) => {    
    return exec.concat(parameters,sanitizer.sanitizeArgument(component.script)).join(' ');
  }),
  visualSelectorOptions: awkData.visualSelectorOptions,
  componentClass: AwkComponent
}

export var parseCommand = commandParser.parseCommand
export var parseComponent = commandParser.parseComponent
export var visualSelectorOptions = commandParser.visualSelectorOptions;
export var componentClass = commandParser.componentClass
