var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

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

function defaultComponentData() {
    return {
        type: 'command',
        exec: "awk",
        parameters: awkData.componentParameters,
        script: ""
    };
}

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.script = str;
    }
});

exports.parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, awkData.parameterOptions, function (component, exec, flags, files, parameters) {
    var script = component.script.replace('\"', "\\\"");
    if (script) {
        script = (/^[\n\ ]+$/.test(script)) ? '"' + script + '"' : '""';
    }
    exec.concat(parameters, script).join(' ');
});

exports.VisualSelectorOptions = awkData.visualSelectorOptions;
//# sourceMappingURL=awk.js.map
