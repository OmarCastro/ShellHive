
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/

$ = require("./_init.js");

optionsParser = 
  shortOptions:
    F : $.setParameter "field separator"  
  longOptions:
    \field-separator : $.sameAs \F  

$.generate(optionsParser)


defaultComponentData = ->
  type:\command
  exec:"awk"
  parameters:
    "field separator" : " "
  script: ""


exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) ->
        component.script = str;
    })
