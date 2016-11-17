import {parserModule, $, CommandComponent, common, sanitizer}  from "./_common.imports";

/*  -c, --bytes            exibe as contagens de byte
  -m, --chars            exibe as contagens de caractere
  -l, --lines            exibe as contagens de nova linha
      --files0-from=F    ler a entrada dos ficheiros especificada por
                           NUL-terminated nomes no ficheiro F;
                           Se F é - então lê nomes da entrada padrão
  -L, --max-line-length  imprimir comprimento da linha mais comprida
  -w, --words            imprimir as contagens de palavras
      --help     exibir esta ajuda e sair
      --version  mostrar a informação de versão e sair
*/



var flags = {
  bytes: {
    name: "print byte count",
    option: 'c',
    longOption: 'bytes',
    description: "print the byte count",
    active: false
  },
  chars:{
    name: "print character count",
    option: 'm',
    longOption: 'chars',
    description: "print character count",
    active: false
  },
  line:{
    name: "print line count",
    option: 'l',
    longOption: 'lines',
    description: "print the word counts",
    active: false
  },
  word:{
    name: "print word count",
    option: 'w',
    longOption: 'words',
    description: "print the newline counts",
    active: false
  },
  longestLine:{
    name: "print longest line length",
    option: 'L',
    longOption: 'max-line-length',
    description: "print the length of the longest line",
    active: false
  },
}

var config:parserModule.Config = { flags:flags }
var WcData = new parserModule.ParserData(config);
var optionsParser = $.optionParserFromConfig(config);

export class WcComponent extends CommandComponent {
  public exec:string = "wc"
  public files: any[] = []
}

function defaultComponentData(){
  var graph = new WcComponent();
  graph.selectors = WcData.componentSelectors
  graph.flags = WcData.componentFlags
  return graph;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(WcData.flagOptions, WcData.selectorOptions);
export var VisualSelectorOptions = WcData.visualSelectorOptions;
export var componentClass = WcComponent
