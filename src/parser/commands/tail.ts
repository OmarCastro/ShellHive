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
import common = require("../utils/init");
import GraphModule = require("../../common/graph");


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
        longOption:"verbose",
        type:'option',
        description:'always show headers'
      },
      never:{
        name:'never',
        type:'option',
        option: "q",
        longOption:['quiet','silent'],
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

var optionsParser = $.optionParserFromConfig(config);

export class TailComponent extends GraphModule.CommandComponent {
  public exec:string = "tail"
  public files: any[] = []
}

function defaultComponentData(){
  var component = new TailComponent();
  component.selectors = tailData.componentSelectors
  component.flags = tailData.componentFlags
  return component;
};


export var parseCommand   = common.commonParseCommand(optionsParser,defaultComponentData)
export var parseComponent = common.commonParseComponent(tailData.flagOptions,tailData.selectorOptions)
export var VisualSelectorOptions = tailData.visualSelectorOptions;
export var componentClass = TailComponent
