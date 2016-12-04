"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
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
    chars: {
        name: "print character count",
        option: 'm',
        longOption: 'chars',
        description: "print character count",
        active: false
    },
    line: {
        name: "print line count",
        option: 'l',
        longOption: 'lines',
        description: "print the word counts",
        active: false
    },
    word: {
        name: "print word count",
        option: 'w',
        longOption: 'words',
        description: "print the newline counts",
        active: false
    },
    longestLine: {
        name: "print longest line length",
        option: 'L',
        longOption: 'max-line-length',
        description: "print the length of the longest line",
        active: false
    },
};
var config = { flags: flags };
var WcData = new _common_imports_1.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var WcComponent = (function (_super) {
    __extends(WcComponent, _super);
    function WcComponent() {
        var _this = _super.apply(this, arguments) || this;
        _this.exec = "wc";
        _this.files = [];
        return _this;
    }
    return WcComponent;
}(_common_imports_1.CommandComponent));
exports.WcComponent = WcComponent;
function defaultComponentData() {
    var graph = new WcComponent();
    graph.selectors = WcData.componentSelectors;
    graph.flags = WcData.componentFlags;
    return graph;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(WcData.flagOptions, WcData.selectorOptions);
exports.visualSelectorOptions = WcData.visualSelectorOptions;
exports.componentClass = WcComponent;
