/*
Examples:
  tar -cf archive.tar foo bar  # Create archive.tar from files foo and bar.
  tar -tvf archive.tar         # List all files in archive.tar verbosely.
  tar -xf archive.tar          # Extract all files from archive.tar.

 Modo principal de operação:

  -A, --catenate, --concatenate   anexar ficheiros tar ao arquivo
  -c, --create               criar um novo arquivo
  -d, --diff, --compare      descobrir diferenças entre o arquivo e o sistema
                             de ficheiros
      --delete               apagar do arquivo (excepto em mag tapes!)
  -r, --append               adicionar ficheiros ao final de um arquivo
  -t, --list                 listar os conteúdos de um arquivo
      --test-label           testar o rótulo do volume de arquivo e sair
  -u, --update               apender apenas ficheiros mais novos que a cópia
                             no arquvo
  -x, --extract, --get       extrair ficheiros de um arquivo

*/
/*
import $ = require("../utils/optionsParser");
import ParserData = require("../utils/parserData");
import common = require("./_init");



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
        description:'print line numbers on all lines'
      },
      nonEmpty:{
        name:'print all lines',
        option: 'b',
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
shortOptions['b'] = $.select(selectors.lineNumber, selectors.lineNumber.options.nonEmpty);
shortOptions['n'] = $.selectIfUnselected(selectors.lineNumber,
      selectors.lineNumber.options.allLines,
      selectors.lineNumber.options.nonEmpty)

var longOptions = optionsParser.shortOptions
longOptions['show-all'] = shortOptions['A']
longOptions['number-nonblank'] = shortOptions['b']
longOptions['number'] = shortOptions['n']




function defaultComponentData(){
  return {
    type: 'command',
    exec: "cat",
    flags: bzipData.componentFlags,
    selectors: bzipData.componentSelectors,
    files: []
  };
};
export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
export var VisualSelectorOptions = bzipData.visualSelectorOptions;
*/ 
