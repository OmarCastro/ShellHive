var $ = require("../utils/optionsParser");
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

function defaultComponentData() {
    var componentFlags = {};
    var componentSelectors = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) {
            continue;
        }
        var value = selectors[key];
        for (var optionName in value.options) {
            var option = value.options[optionName];
            if (option.default) {
                console.log(key);
                var valueObj = {
                    name: option.name,
                    type: option.type
                };
                if (option.defaultValue) {
                    valueObj['value'] = option.defaultValue;
                }
                componentSelectors[value.name] = valueObj;
                console.info("componentSelectors ", componentSelectors);
                break;
            }
        }
    }

    return {
        type: 'command',
        exec: "grep",
        flags: componentFlags,
        selectors: componentSelectors,
        pattern: null,
        files: []
    };
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        if (component.pattern == null) {
            component.pattern = str;
        } else {
            component.files.push(str);
        }
    }
});

exports.parseComponent = common.commonParseComponent(grepCommandData.flagOptions, grepCommandData.selectorOptions, null, function (component, exec, flags, files) {
    var pattern = component.pattern;
    if (pattern) {
        pattern = (pattern.indexOf(" ") >= 0) ? '"' + pattern + '"' : pattern;
    }
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
