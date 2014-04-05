/*

  -c, --bytes=[-]K         print the first K bytes of each file;
                             with the leading '-', print all but the last
                             K bytes of each file
  -n, --lines=[-]K         print the first K lines instead of the first 10;
                             with the leading '-', print all but the last
                             K lines of each file
  -q, --quiet, --silent    nuncar mostrar cabeçalhos com nomes de ficheiros
  -v, --verbose            mostrar sempre cabeçalhos com nomes de ficheiros

*/


import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("./_init");

var selectors = {
  showHeaders:{
    name: 'show headers',
    description: 'show headers with file name',
    options:{
      default:{
        name:'default',
        type:'option',
        option: <string> null,
        description:'default: show headers only if tailing multiple files'
      },
      always:{
        name:'always',
        option: "v",
        type:'option',
        description:'always show headers'
      },
      never:{
        name:'never',
        type:'option',
        option: "v",
        description:'no not show headers'        
      }
    }
  },
  NumOf:{
    name:'print last',
    description: 'define if last number of lines or bytes',
    options:{
      lines:{
        name: 'lines',
        type: 'numeric parameter',
        option: "n",
        default: 10
      },
      bytes:{
        name: 'bytes',
        type: 'numeric parameter',
        option: "b",
        default: 10        
      }
    }


  }
}




var tailData = new parserModule.ParserData(config);

var config = {
  selectors:selectors
}


var optionsParser = {
  shortOptions:{
    q  :  $.select(selectors.showHeaders.name, selectors.showHeaders.options.never.name),
    v  :  $.select(selectors.showHeaders.name, selectors.showHeaders.options.always.name)
  },
  longOptions:{
    quiet :   $.sameAs("q"),
    silent :  $.sameAs("q"),
    verbose : $.sameAs("v")
  }
}

$.generate(optionsParser)


var defaultComponentData = function(){
  var ref$;
  return {
    type: 'command',
    exec: 'tail',
    flags: {},
    selectors: {
      "show headers":"default"
    },
    files: []
  };
};


export var parseCommand   = common.commonParseCommand(optionsParser,defaultComponentData)
export var parseComponent = common.commonParseComponent(tailData.flagOptions,tailData.selectorOptions)