/*
grep:
Matcher Selection:
arguments:
- ["E","--extended-regexp","Interpret PATTERN as an extended regular expression"]
- ["F","--fixed-strings","Interpret PATTERN as a list of fixed strings, separated by newlines, any of which is to be matched."]
- ["G","--basic-regexp","Interpret PATTERN as a basic regular expression (BRE, see below).  This is the default."]
- ["P","--perl-regexp","display $ at end of each line"]
Matching Control:
arguments:
- ["e PATTERN","--regexp=PATTERN","Use PATTERN as the pattern.  This can be used to specify multiple search patterns, or to protect a pattern beginning with a hyphen (-)."]
- ["f FILE","--file=FILE","Obtain patterns from FILE, one per line.  The empty file contains zero patterns, and therefore matches nothing."]
- ["i","--ignore-case","Ignore case distinctions in both the PATTERN and the input files."]
- ["v","--invert-match","Invert the sense of matching, to select non-matching lines."]
- ["w","--word-regexp"," Select only those lines containing matches that form whole words.  The test is that the matching substring must either be at the beginning of the line, or preceded by a non-
word constituent character.  Similarly, it must be either at the end of the line or followed by a non-word constituent character.  Word-constituent characters  are  letters,
digits, and the underscore."]
- ["x","--line-regexp","Select only those matches that exactly match the whole line."]
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

var parameters = {
    separator: {
        name: 'text',
        option: null,
        type: "string",
        description: "filter entries by anything other than the content",
        defaultValue: ""
    }
};

var flags = {
    interpretEscape: {
        name: "Interpret escape characters",
        option: 'e',
        description: "Interpret escape characters",
        active: false
    },
    newline: {
        name: "no trailing newline",
        option: 'n',
        description: "no not output trailing newline",
        active: false
    }
};

var config = {
    parameters: parameters,
    flags: flags
};

var echoData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);

var EchoComponent = (function (_super) {
    __extends(EchoComponent, _super);
    function EchoComponent() {
        _super.apply(this, arguments);
        this.exec = "echo";
    }
    return EchoComponent;
})(GraphModule.CommandComponent);
exports.EchoComponent = EchoComponent;

function defaultComponentData() {
    var component = new EchoComponent();
    component.parameters = echoData.componentParameters;
    component.flags = echoData.componentFlags;

    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.parameters["text"] = str;
    }
});
exports.parseComponent = common.commonParseComponent(echoData.flagOptions, echoData.selectorOptions, echoData.parameterOptions);
exports.VisualSelectorOptions = echoData.visualSelectorOptions;
exports.componentClass = EchoComponent;
