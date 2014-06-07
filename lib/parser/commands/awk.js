/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
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
var sanitizer = require("../utils/sanitizer");
var GraphModule = require("../../common/graph");

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
var awkData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        F: $.setParameter(config.parameters.separator.name)
    },
    longOptions: {
        "field-separator": $.sameAs('F')
    }
};

$.generate(optionsParser);

var AwkComponent = (function (_super) {
    __extends(AwkComponent, _super);
    function AwkComponent() {
        _super.apply(this, arguments);
        this.exec = "awk";
        this.script = "";
        this.files = [];
    }
    return AwkComponent;
})(GraphModule.CommandComponent);
exports.AwkComponent = AwkComponent;

function defaultComponentData() {
    var component = new AwkComponent();
    component.parameters = awkData.componentParameters;
    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.script = str;
    }
});

exports.parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, awkData.parameterOptions, function (component, exec, flags, files, parameters) {
    return exec.concat(parameters, sanitizer.sanitizeArgument(component.script)).join(' ');
});

exports.VisualSelectorOptions = awkData.visualSelectorOptions;
exports.componentClass = AwkComponent;