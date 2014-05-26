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
var common = require("../utils/init");
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
        name: 'first',
        description: 'define if first number of lines or bytes',
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

var headData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);

var lsCommandData = new parserModule.ParserData(config);

var HeadComponent = (function (_super) {
    __extends(HeadComponent, _super);
    function HeadComponent() {
        _super.apply(this, arguments);
        this.exec = "head";
        this.files = [];
    }
    return HeadComponent;
})(GraphModule.CommandComponent);
exports.HeadComponent = HeadComponent;

function defaultComponentData() {
    var component = new HeadComponent();
    component.selectors = headData.componentSelectors;
    component.flags = headData.componentFlags;
    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(headData.flagOptions, headData.selectorOptions);
exports.VisualSelectorOptions = headData.visualSelectorOptions;
exports.componentClass = HeadComponent;
