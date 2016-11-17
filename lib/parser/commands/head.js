"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
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
var headData = new _common_imports_1.parserModule.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var lsCommandData = new _common_imports_1.parserModule.ParserData(config);
var HeadComponent = (function (_super) {
    __extends(HeadComponent, _super);
    function HeadComponent() {
        _super.apply(this, arguments);
        this.exec = "head";
        this.files = [];
    }
    return HeadComponent;
}(_common_imports_1.CommandComponent));
exports.HeadComponent = HeadComponent;
function defaultComponentData() {
    var component = new HeadComponent();
    component.selectors = headData.componentSelectors;
    component.flags = headData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(headData.flagOptions, headData.selectorOptions);
exports.VisualSelectorOptions = headData.visualSelectorOptions;
exports.componentClass = HeadComponent;
