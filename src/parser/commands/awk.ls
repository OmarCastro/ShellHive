
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/

$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");

val = $.generateSelectors({});

selectors = val.selectors
selectorOptions = val.selectorOptions
exports.VisualSelectorOptions = val.VisualSelectorOptions

optionsParser = 
  shortOptions:
    F : $.setParameter "field separator"  
  longOptions:
    \field-separator : $.sameAs \F  

$.generate(optionsParser)

parameters = {
  "field separator"
}

parameterOptions = {
  "field separator" : \F
}


defaultComponentData = ->
  type:\command
  exec:"awk"
  parameters:
    "field separator" : " "
  script: ""




exports.parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) ->
        component.script = str;
    })

exports.parseComponent = common.commonParseComponent {},{},parameterOptions, (component,exec,flags,files,parameters) ->
  script = component.script.replace('\"',"\\\"")
  if script 
    if /^[\n\ ]+$/.test script
      script = "\"#repStr\""
  else
    script = "\"\"";
  (exec ++ parameters ++ script) * ' '