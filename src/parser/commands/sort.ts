import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("../utils/init");
import GraphModule = require("../../common/graph");


var nullstr:string = null;

var selectors = {
  action:{
    name: 'action',
    description: 'action to exectute',
    options:{
      sort:{
        name:'sort',
        option: nullstr,
        description:'sort',
        defaut:true
      },
      check:{
        name:'check',
        option: 'c',
        description:'sort by number'
      },
      silentCheck:{
        name:'quiet check',
        option: 'g',
        description:'print line numbers on all lines'
      },
      merge:{
        name:'merge files',
        option: 'm',
        description:'print line numbers on all lines'
      }
    }
  },
  sort:{
    name: 'sort',
    description: 'sort according to option',
    options:{
      text:{
        name:'text',
        option: nullstr,
        description:'sort by text',
        defaut:true
      },
      numeric:{
        name:'numeric',
        option: 'n',
        description:'sort by number'
      },
      generalNumeric:{
        name:'general numeric',
        option: 'g',
        description:'print line numbers on all lines'
      },
      humanNumeric:{
        name:'human numeric',
        option: 'h',
        description:'print line numbers on non empty lines'
      },
      Month:{
        name:'month',
        option: 'M',
        description:'print line numbers on non empty lines'
      },
      random:{
        name:'random',
        option: 'R',
        description:'print line numbers on non empty lines'
      },
      version:{
        name:'version',
        option: 'V',
        description:'print line numbers on non empty lines'
      }
    }
  }
}



var flags = {
  reverse: {
    name: "reverse",
    option: 'r',
    description: "print TAB characters like ^I",
    active: false
  },
  unique: {
    name: "unique",
    option: 'u',
    description: "suppress repeated empty output lines",
    active: false
  },
  ignoreCase:{
    name: "ignore case",
    option: 'E',
    description: "print $ after each line",
    active: false
  },
  ignoreNonprinting:{
    name: "ignore non-printing chars",
    option: 'v',
    description: "use ^ and M- notation, except for LFD and TAB",
    active: false
  },
  ignoreLeadingBlanks: {
    name: "ignore leading blanks",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  }
}

var parameters = {
  key:{
    name:'key',
    option: 'k',
    type: "string",
    description:"filter entries by anything other than the content",
    defaultValue: ""
  }
}

var config:parserModule.Config = {
  selectors:selectors,
  flags:flags,
  parameters:parameters
}



var bzipData = new parserModule.ParserData(config);

var optionsParser = {
  shortOptions: {
    b: $.switchOn(flags.ignoreLeadingBlanks),
    d: $.ignore,
    f: $.switchOn(flags.ignoreCase),
    g: $.select(selectors.sort, selectors.sort.options.generalNumeric),
    i: $.switchOn(flags.ignoreNonprinting),
    M: $.select(selectors.sort, selectors.sort.options.Month),
    h: $.select(selectors.sort, selectors.sort.options.humanNumeric),
    n: $.select(selectors.sort, selectors.sort.options.numeric),
    R: $.select(selectors.sort, selectors.sort.options.random),
    r: $.switchOn(flags.reverse),
    V: $.select(selectors.sort, selectors.sort.options.version),
    c: $.select(selectors.action, selectors.action.options.check),
    C: $.select(selectors.action, selectors.action.options.silentCheck),
    k: $.setParameter(parameters.key.name),
    m: $.select(selectors.action, selectors.action.options.merge),
    o: $.ignore,
    s: $.ignore,
    S: $.ignore,
    t: $.ignore,
    T: $.ignore,
    u: $.switchOn(flags.unique),
    z: $.ignore,
  },
  longOptions: {
    "ignore-leading-blanks": $.sameAs('b'),
    "dictionary-order":  $.ignore,
    "ignore-case": $.sameAs('f'),
    "general-numeric": $.sameAs('g'),
    "ignore-nonprinting": $.sameAs('i'),
    "month-sort":  $.sameAs('M'),
    "human-numeric-sort": $.sameAs('h'),
    "numeric-sort":  $.sameAs('n'),
    "unique":$.sameAs('u')
  }
};
$.generate(optionsParser);

function defaultComponentData(){
  return {
    type: 'command',
    exec: "sort",
    flags: bzipData.componentFlags,
    selectors: bzipData.componentSelectors,
    files: []
  };
};


export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions,bzipData.parameterOptions);
export var VisualSelectorOptions = bzipData.visualSelectorOptions;
