
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/



import {parserModule, $, CommandComponent, common, sanitizer}  from "./_common.imports";


var config = {
  parameters:{
    separator:{
      name:'field separator',
      option: 'F',
      type: "string",
      description:"filter entries by anything other than the content",
      defaultValue: ""
    }
  }
}
var awkData = new parserModule.ParserData(config);


var optionsParser = { 
  shortOptions:{
    F : $.setParameter(config.parameters.separator.name)
  },
  longOptions:{
    "field-separator" : $.sameAs('F')  
  }
}

$.generate(optionsParser)


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

export var parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
  string: (component:AwkComponent, str) => {
      component.script = str;
    }
  })

export var parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions,awkData.parameterOptions, 
  (component,exec,flags,files,parameters) => {    
    return exec.concat(parameters,sanitizer.sanitizeArgument(component.script)).join(' ');
  })

export var VisualSelectorOptions = awkData.visualSelectorOptions;
export var componentClass = AwkComponent
