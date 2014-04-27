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
    name:'first',
    description: 'define if first number of lines or bytes',
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

var headData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);
optionsParser.shortOptions['n'] = $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.lines.name)
optionsParser.shortOptions['b'] = $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.bytes.name)


var lsCommandData = new parserModule.ParserData(config);


export class HeadComponent extends GraphModule.CommandComponent {
  public exec:string = "head"
  public files: any[] = []
}

function defaultComponentData(){
  var component = new HeadComponent();
  component.selectors = headData.componentSelectors
  component.flags = headData.componentFlags
  return component;
};

export var parseCommand   = common.commonParseCommand(optionsParser,defaultComponentData)
export var parseComponent = common.commonParseComponent(headData.flagOptions,headData.selectorOptions)
export var VisualSelectorOptions = headData.visualSelectorOptions;
export var componentClass = HeadComponent
