var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    format: {
        name: "format",
        description: "select attribute to sort",
        options: {
            normal: {
                name: 'normal',
                option: null,
                description: 'do not print line numbers',
                default: true
            },
            RCS: {
                name: 'RCS',
                option: 'n',
                description: 'print line numbers on all lines'
            },
            edScript: {
                name: 'ed script',
                option: 'e',
                description: 'print line numbers on non empty lines'
            }
        }
    }
};

var flags = {
    ignoreCase: {
        name: "ignore case",
        option: 'i',
        description: "print TAB characters like ^I",
        active: false
    },
    ignoreBlankLines: {
        name: "ignore blank lines",
        option: 'B',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    ignoreSpaceChange: {
        name: "ignore space change",
        option: 'b',
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
        b: $.switchOn(flags.ignoreSpaceChange),
        B: $.switchOn(flags.ignoreBlankLines),
        i: $.switchOn(flags.ignoreCase),
        q: $.ignore,
        e: $.select(selectors.format, selectors.format.options.edScript),
        n: $.select(selectors.format, selectors.format.options.RCS)
    },
    longOptions: {
        "normal": $.select(selectors.format, selectors.format.options.normal),
        "ed": $.select(selectors.format, selectors.format.options.edScript),
        "rcs": $.select(selectors.format, selectors.format.options.RCS),
        "ignore-blank-lines": $.sameAs('B'),
        "ignore-space-change": $.sameAs('b'),
        "ignore-case": $.sameAs('i'),
        "brief": $.sameAs('q')
    }
};

$.generate(optionsParser);

function defaultComponentData() {
    console.log("imiokijiuh");

    return {
        type: 'command',
        exec: "diff",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=diff.js.map
