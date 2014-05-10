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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $ = require("../utils/optionsParser");
var GraphModule = require("../../common/graph");
var parserModule = require("../utils/parserData");
var common = require("./_init");

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
    }
};

var config = { flags: flags };
var WcData = new parserModule.ParserData(config);
var optionsParser = $.optionParserFromConfig(config);

var WcComponent = (function (_super) {
    __extends(WcComponent, _super);
    function WcComponent() {
        _super.apply(this, arguments);
        this.exec = "wc";
        this.files = [];
    }
    return WcComponent;
})(GraphModule.CommandComponent);
exports.WcComponent = WcComponent;

function defaultComponentData() {
    var graph = new WcComponent();
    graph.selectors = WcData.componentSelectors;
    graph.flags = WcData.componentFlags;
    return graph;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(WcData.flagOptions, WcData.selectorOptions);
exports.VisualSelectorOptions = WcData.visualSelectorOptions;
exports.componentClass = WcComponent;
//# sourceMappingURL=wc.js.map
