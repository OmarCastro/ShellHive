/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/
(function(){
  var $, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  optionsParser = {
    shortOptions: {
      F: $.setParameter("field separator")
    },
    longOptions: {
      'field-separator': $.sameAs('F')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "awk",
      parameters: {
        "field separator": " "
      },
      script: ""
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData, {
    string: function(component, str){
      return component.script = str;
    }
  });
}).call(this);
