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
        description:'default: show headers only if tailing multiple files',
        default:true
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
    name:'last',
    description: 'define if last number of lines or bytes',
    options:{
      lines:{
        name: 'lines',
        type: 'numeric parameter',
        option: "n",
        default: true,
        defaultValue: 10
      },
      bytes:{
        name: 'bytes',
        type: 'numeric parameter',
        option: "b",
        defaultValue: 10        
      }
    }


  }
}


var config = {
  selectors:selectors
}

var tailData = new parserModule.ParserData(config);



var optionsParser = {
  shortOptions:{
    q : $.select(selectors.showHeaders.name, selectors.showHeaders.options.never.name),
    v : $.select(selectors.showHeaders.name, selectors.showHeaders.options.always.name),
    n : $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.lines.name),
    b : $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.bytes.name)
  },
  longOptions:{
    quiet :   $.sameAs("q"),
    silent :  $.sameAs("q"),
    verbose : $.sameAs("v")
  }
}

$.generate(optionsParser)


var defaultComponentData = function(){

  var componentSelectors = {}
  for (var key in selectors) {
    if(!selectors.hasOwnProperty(key)){
      continue;
    }
    var value = selectors[key]
    for (var optionName in value.options){
      var option = value.options[optionName]
      if(option.default){
        console.log(key);
        var valueObj = {
          name:option.name,
          type:option.type,
        }
        if(option.defaultValue){
          valueObj['value'] = option.defaultValue
        }
        componentSelectors[value.name] = valueObj
        break;
      }
    }
  }

  return {
    type: 'command',
    exec: 'tail',
    flags: {},
    selectors: componentSelectors,
    files: []
  };
};


export var parseCommand   = common.commonParseCommand(optionsParser,defaultComponentData)
export var parseComponent = common.commonParseComponent(tailData.flagOptions,tailData.selectorOptions)
export var VisualSelectorOptions = tailData.visualSelectorOptions;
