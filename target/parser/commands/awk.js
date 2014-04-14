var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var config = {};

var awkData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        F: $.setParameter("field separator")
    },
    longOptions: {
        "field-separator": $.sameAs('F')
    }
};
$.generate(optionsParser);

var parameterOptions = {
    "field separator": 'F'
};

function defaultComponentData() {
    return {
        type: 'command',
        exec: "awk",
        parameters: {
            "field separator": " "
        },
        script: ""
    };
}

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.script = str;
    }
});

exports.parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, parameterOptions, function (component, exec, flags, files, parameters) {
    var script = component.script.replace('\"', "\\\"");
    if (script) {
        script = (/^[\n\ ]+$/.test(script)) ? '"' + script + '"' : '""';
    }
    exec.concat(parameters, script).join(' ');
});

exports.VisualSelectorOptions = awkData.visualSelectorOptions;
//# sourceMappingURL=awk.js.map
