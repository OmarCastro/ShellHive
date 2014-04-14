
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/



import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("./_init");

var config = {}

var awkData = new parserModule.ParserData(config);


var optionsParser = { 
  shortOptions:{
    F : $.setParameter("field separator")
  },
  longOptions:{
    "field-separator" : $.sameAs('F')  
  }
}
$.generate(optionsParser)


var parameterOptions = {
  "field separator" : 'F'
}


function defaultComponentData(){
  return{
    type:'command',
    exec:"awk",
    parameters:{
      "field separator" : " "
    },
    script: ""
  }
}

export var parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) => {
        component.script = str;
      }
    })

export var parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions,parameterOptions, (component,exec,flags,files,parameters) => {
  var script = component.script.replace('\"',"\\\"");
  if(script){
    script = (/^[\n\ ]+$/.test(script)) ? '"'+script+'"' : '""';
  }
  exec.concat(parameters,script).join(' ');
  })

export var VisualSelectorOptions = awkData.visualSelectorOptions;
