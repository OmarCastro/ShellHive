var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    lineNumber: {
        name: 'line number',
        description: 'action to print if line numbers on the output',
        options: {
            noprint: {
                name: 'do not print',
                option: null,
                description: 'do not print line numbers',
                default: true
            },
            allLines: {
                name: 'print all lines',
                option: 'n',
                description: 'print line numbers on all lines'
            },
            nonEmpty: {
                name: 'print all lines',
                option: 'b',
                description: 'print line numbers on non empty lines'
            }
        }
    }
};

var flags = {
    tabs: {
        name: "show tabs",
        option: 'T',
        description: "print TAB characters like ^I",
        active: false
    },
    ends: {
        name: "show ends",
        option: 'E',
        description: "print $ after each line",
        active: false
    },
    nonPrint: {
        name: "show non-printing",
        option: 'v',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    sblanks: {
        name: "squeeze blank",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        A: $.switchOn(flags.nonPrint, flags.tabs, flags.ends),
        e: $.switchOn(flags.nonPrint, flags.ends),
        T: $.switchOn(flags.tabs),
        v: $.switchOn(flags.nonPrint),
        E: $.switchOn(flags.ends),
        s: $.switchOn(flags.sblanks),
        t: $.switchOn(flags.nonPrint, flags.tabs),
        b: $.select(selectors.lineNumber, selectors.lineNumber.options.nonEmpty),
        n: $.selectIfUnselected(selectors.lineNumber, selectors.lineNumber.options.allLines, selectors.lineNumber.options.nonEmpty)
    },
    longOptions: {
        "show-all": $.sameAs('A'),
        "number-nonblank": $.sameAs('b'),
        "show-ends": $.sameAs('E'),
        "number": $.sameAs('n'),
        "squeeze-blank": $.sameAs('s'),
        "show-tabs": $.sameAs('T'),
        "show-nonprinting": $.sameAs('v')
    }
};
$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "cat",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=cat.js.map
