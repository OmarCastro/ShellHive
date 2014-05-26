
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/



import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("../utils/init");
import GraphModule = require("../../common/graph");


var config = {
  parameters:{
    separator:{
      name:'path',
      option: null,
      type: "string",
      description:"path of file to find",
      defaultValue: ""
    },
    maxLevelDepht:{
      name:'max level depht',
      option: "-maxdepth",
      type: "numeric",
      description:"path of file to find",
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


export class AwkComponent extends GraphModule.CommandComponent {
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
    var script = component.script.replace('"','\\"');
    if(script){
      script = (/[\n\ ]/.test(script)) ? '"'+script+'"' : script;
    }    
    return exec.concat(parameters,script).join(' ');
  })

export var VisualSelectorOptions = awkData.visualSelectorOptions;
export var componentClass = AwkComponent
