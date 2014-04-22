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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");
var GraphModule = require("../../common/graph");

var selectors = {
    showHeaders: {
        name: 'show headers',
        description: 'show headers with file name',
        options: {
            default: {
                name: 'default',
                type: 'option',
                option: null,
                description: 'default: show headers only if tailing multiple files',
                default: true
            },
            always: {
                name: 'always',
                option: "v",
                longOption: "verbose",
                type: 'option',
                description: 'always show headers'
            },
            never: {
                name: 'never',
                type: 'option',
                option: "q",
                longOption: ['quiet', 'silent'],
                description: 'no not show headers'
            }
        }
    },
    NumOf: {
        name: 'last',
        description: 'define if last number of lines or bytes',
        options: {
            lines: {
                name: 'lines',
                type: 'numeric parameter',
                option: "n",
                default: true,
                defaultValue: 10
            },
            bytes: {
                name: 'bytes',
                type: 'numeric parameter',
                option: "b",
                defaultValue: 10
            }
        }
    }
};

var config = {
    selectors: selectors
};

var tailData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);
optionsParser['n'] = $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.lines.name);
optionsParser['b'] = $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.bytes.name);

var TailComponent = (function (_super) {
    __extends(TailComponent, _super);
    function TailComponent() {
        _super.apply(this, arguments);
        this.exec = "tail";
        this.files = [];
    }
    return TailComponent;
})(GraphModule.CommandComponent);

function defaultComponentData() {
    var component = new TailComponent();
    component.selectors = tailData.componentSelectors;
    component.flags = tailData.componentFlags;
    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(tailData.flagOptions, tailData.selectorOptions);
exports.VisualSelectorOptions = tailData.visualSelectorOptions;
//# sourceMappingURL=tail.js.map
