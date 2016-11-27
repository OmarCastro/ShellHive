import {ParserData, Config, $, CommandComponent, common, sanitizer}  from "./_common.imports";

var selectors = {
  lineNumber:{
    name: 'line number',
    description: 'action to print if line numbers on the output',
    options:{
      noprint:{
        name:'do not print',
        option: null,
        description:'do not print line numbers',
        default:true
      },
      allLines:{
        name:'print all lines',
        option: 'n',
        longOption: 'number',
        description:'print line numbers on all lines'
      },
      nonEmpty:{
        name:'print non-empty lines',
        option: 'b',
        longOption: 'number-nonblank',
        description:'print line numbers on non empty lines'
      }
    }
  }
}

var flags = {
  tabs: {
    name: "show tabs",
    option: 'T',
    longOption: 'show-tabs',
    description: "print TAB characters like ^I",
    active: false
  },
  ends:{
    name: "show ends",
    option: 'E',
    longOption: 'show-ends',
    description: "print $ after each line",
    active: false
  },
  nonPrint:{
    name: "show non-printing",
    option: 'v',
    longOption: 'show-nonprinting',
    description: "use ^ and M- notation, except for LFD and TAB",
    active: false
  },
  sblanks: {
    name: "squeeze blank",
    option: 's',
    longOption: 'squeeze-blank',
    description: "suppress repeated empty output lines",
    active: false
  },
}

var config:Config = {
  selectors:selectors,
  flags:flags
}



var bzipData = new ParserData(config);


var optionsParser = $.optionParserFromConfig(config);

var shortOptions = optionsParser.shortOptions
shortOptions['A'] = $.switchOn(flags.nonPrint, flags.tabs, flags.ends);
shortOptions['n'] = $.selectIfUnselected(selectors.lineNumber, 
      selectors.lineNumber.options.allLines, 
      selectors.lineNumber.options.nonEmpty)

var longOptions = optionsParser.shortOptions
longOptions['show-all'] = shortOptions['A']
longOptions['number'] = shortOptions['n']


export class CatComponent extends CommandComponent {
  public exec:string = "cat"
  public files: any[] = []
}


function defaultComponentData(){
  var graph = new CatComponent();
  graph.selectors = bzipData.componentSelectors
  graph.flags = bzipData.componentFlags
  return graph;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
export var visualSelectorOptions = bzipData.visualSelectorOptions;
export var componentClass = CatComponent

