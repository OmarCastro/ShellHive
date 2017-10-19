"use strict";
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _common_imports_1 = require("./_common.imports");
var parameters = {
    separator: {
        name: 'field separator',
        option: 'F',
        type: "string",
        description: "filter entries by anything other than the content",
        defaultValue: "",
    }
};
var config = {
    parameters: parameters
};
var awkData = new _common_imports_1.ParserData(config);
var optionsParser = {
    shortOptions: {
        F: _common_imports_1.$.setParameter(parameters.separator)
    },
    longOptions: {
        "field-separator": _common_imports_1.$.setParameter(parameters.separator)
    }
};
var AwkComponent = (function (_super) {
    __extends(AwkComponent, _super);
    function AwkComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.exec = "awk";
        _this.script = "";
        _this.files = [];
        return _this;
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
exports.commandParser = {
    parseCommand: _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData, { string: function (component, str) {
            component.script = str;
        }
    }),
    parseComponent: _common_imports_1.common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, awkData.parameterOptions, function (component, exec, flags, files, parameters) {
        return exec.concat(parameters, _common_imports_1.sanitizer.sanitizeArgument(component.script)).join(' ');
    }),
    visualSelectorOptions: awkData.visualSelectorOptions,
    componentClass: AwkComponent
};
exports.parseCommand = exports.commandParser.parseCommand;
exports.parseComponent = exports.commandParser.parseComponent;
exports.visualSelectorOptions = exports.commandParser.visualSelectorOptions;
exports.componentClass = exports.commandParser.componentClass;
