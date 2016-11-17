"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
var parameters = {
    set1: {
        name: 'set1',
        option: null,
        type: "string",
        description: "URL of the application",
        defaultValue: ""
    },
    set2: {
        name: 'set2',
        option: null,
        type: "numeric parameter",
        description: "Maximum  time  in  seconds that you allow the whole operation to take",
        defaultValue: ""
    }
};
var flags = {
    complement: {
        name: "complement",
        option: 'c',
        longOption: 'show-tabs',
        description: "use SET1 complemet",
        active: false
    },
    delete: {
        name: "delete",
        option: 'd',
        longOption: 'delete',
        description: "delete characters in SET1, do not translate",
        active: false
    },
    squeeze: {
        name: "squeeze repeats",
        option: 's',
        longOption: 'squeeze-repeats',
        description: "replace each input sequence of a repeated character that is  listed  in  SET1 with a single occurrence of that character",
        active: false
    },
    truncate: {
        name: "truncate set1",
        option: 't',
        longOption: 'truncate-set1',
        description: "suppress repeated empty output lines",
        active: false
    },
};
var config = {
    flags: flags,
    parameters: parameters
};
var bzipData = new _common_imports_1.parserModule.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var shortOptions = optionsParser.shortOptions;
shortOptions['C'] = _common_imports_1.$.switchOn(flags.complement);
var TrComponent = (function (_super) {
    __extends(TrComponent, _super);
    function TrComponent() {
        _super.apply(this, arguments);
        this.exec = "tr";
    }
    return TrComponent;
}(_common_imports_1.CommandComponent));
exports.TrComponent = TrComponent;
function defaultComponentData() {
    var component = new TrComponent();
    component.selectors = bzipData.componentSelectors;
    component.parameters = bzipData.componentParameters;
    component.flags = bzipData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        if (component.parameters.set1 == "") {
            component.parameters.set1 = str;
        }
        else {
            component.parameters.set2 = str;
        }
        ;
    }
});
exports.parseComponent = _common_imports_1.common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions, bzipData.parameterOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
exports.componentClass = TrComponent;
