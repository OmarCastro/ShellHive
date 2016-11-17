/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
var config = {
    parameters: {
        separator: {
            name: 'field separator',
            option: 'F',
            type: "string",
            description: "filter entries by anything other than the content",
            defaultValue: ""
        }
    }
};
var awkData = new _common_imports_1.parserModule.ParserData(config);
var optionsParser = {
    shortOptions: {
        F: _common_imports_1.$.setParameter(config.parameters.separator.name)
    },
    longOptions: {
        "field-separator": _common_imports_1.$.sameAs('F')
    }
};
_common_imports_1.$.generate(optionsParser);
var AwkComponent = (function (_super) {
    __extends(AwkComponent, _super);
    function AwkComponent() {
        _super.apply(this, arguments);
        this.exec = "awk";
        this.script = "";
        this.files = [];
    }
    return AwkComponent;
}(_common_imports_1.CommandComponent));
exports.AwkComponent = AwkComponent;
function defaultComponentData() {
    var component = new AwkComponent();
    component.parameters = awkData.componentParameters;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.script = str;
    }
});
exports.parseComponent = _common_imports_1.common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, awkData.parameterOptions, function (component, exec, flags, files, parameters) {
    return exec.concat(parameters, _common_imports_1.sanitizer.sanitizeArgument(component.script)).join(' ');
});
exports.VisualSelectorOptions = awkData.visualSelectorOptions;
exports.componentClass = AwkComponent;
