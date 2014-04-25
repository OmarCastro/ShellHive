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
var GraphModule = require("../../common/graph");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    patternType: {
        name: "pattern type",
        description: "define the pattern to filter",
        options: {
            extRegex: {
                name: "extended regexp",
                option: "E",
                type: 'option',
                description: 'use pattern as an extended regular expression'
            },
            fixedStrings: {
                name: "fixed strings",
                option: "F",
                type: 'option',
                description: 'use pattern as a set of expressions separated by lines'
            },
            basicRegex: {
                name: "basic regexp",
                option: null,
                type: 'option',
                description: 'use pattern as a basic regular expression',
                default: true
            }
        }
    },
    match: {
        name: "match",
        description: "",
        options: {
            default: {
                name: "default",
                option: null,
                type: 'option',
                description: 'do not force the pattern to filter complete words or lines',
                default: true
            },
            word: {
                name: "whole word",
                option: "F",
                type: 'option',
                description: 'force the pattern to filter complete words'
            },
            line: {
                name: "whole line",
                option: null,
                type: 'option',
                description: 'force the pattern to filter complete lines'
            }
        }
    }
};

var flags = {
    ignoreCase: {
        name: "ignore case",
        option: 'T',
        description: "print TAB characters like ^I",
        active: false
    },
    invertMatch: {
        name: "invert match",
        option: 'E',
        description: "print $ after each line",
        active: false
    }
};

var optionsParser = {
    shortOptions: {
        E: $.select(selectors.patternType, selectors.patternType.options.extRegex),
        F: $.select(selectors.patternType, selectors.patternType.options.fixedStrings),
        G: $.select(selectors.patternType, selectors.patternType.options.basicRegex),
        i: $.switchOn(flags.ignoreCase),
        //P  :  $.select(selectors.patternType, patternTypeSelector.perlRegex),
        v: $.switchOn(flags.invertMatch),
        x: $.select(selectors.match, selectors.match.options.line),
        w: $.selectIfUnselected(selectors.match.name, selectors.match.options.word.name, selectors.match.options.line.name),
        y: $.switchOn(flags.ignoreCase)
    },
    longOptions: {
        "extended-regexp": $.sameAs("E"),
        "fixed-strings": $.sameAs("F"),
        "basic-regexp": $.sameAs("G"),
        "perl-regexp": $.sameAs("P"),
        "ignore-case": $.sameAs("i"),
        "invert-match": $.sameAs("v"),
        "word-regexp": $.sameAs("w"),
        "line-regexp": $.sameAs("x")
    }
};
$.generate(optionsParser);

var config = {
    selectors: selectors,
    flags: flags
};

var grepCommandData = new parserModule.ParserData(config);

var GrepComponent = (function (_super) {
    __extends(GrepComponent, _super);
    function GrepComponent() {
        _super.apply(this, arguments);
        this.exec = "grep";
        this.files = [];
        this.pattern = null;
    }
    return GrepComponent;
})(GraphModule.CommandComponent);

function defaultComponentData() {
    var graph = new GrepComponent();
    graph.selectors = grepCommandData.componentSelectors;
    graph.flags = grepCommandData.componentFlags;
    return graph;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        if (component.pattern === null) {
            component.pattern = str || "";
        } else {
            return "continue";
        }
    }
});

exports.parseComponent = common.commonParseComponent(grepCommandData.flagOptions, grepCommandData.selectorOptions, null, function (component, exec, flags, files) {
    var pattern = component.pattern || "";
    pattern = (pattern.indexOf(" ") >= 0) ? '"' + pattern + '"' : pattern;

    //console.error(pattern + " - " + files.length );
    //console.error(!!pattern + " - " + !!files.length );
    if (pattern && files.length) {
        return exec.concat(flags, pattern, files).join(' ');
    } else if (pattern) {
        return exec.concat(flags, pattern, files).join(' ');
    } else if (files.length) {
        return exec.concat(flags, '""', files).join(' ');
    } else
        return exec.concat(flags).join(' ');
});

exports.VisualSelectorOptions = grepCommandData.visualSelectorOptions;
//# sourceMappingURL=grep.js.map
