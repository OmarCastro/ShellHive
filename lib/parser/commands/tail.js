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
var tailData = new _common_imports_1.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var TailComponent = (function (_super) {
    __extends(TailComponent, _super);
    function TailComponent() {
        var _this = _super.apply(this, arguments) || this;
        _this.exec = "tail";
        _this.files = [];
        return _this;
    }
    return TailComponent;
}(_common_imports_1.CommandComponent));
exports.TailComponent = TailComponent;
function defaultComponentData() {
    var component = new TailComponent();
    component.selectors = tailData.componentSelectors;
    component.flags = tailData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(tailData.flagOptions, tailData.selectorOptions);
exports.visualSelectorOptions = tailData.visualSelectorOptions;
exports.componentClass = TailComponent;
