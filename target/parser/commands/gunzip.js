var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    }
};

var config = {
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    k: $.switchOn(flags.keep),
    f: $.switchOn(flags.force),
    q: $.switchOn(flags.quiet),
    v: $.switchOn(flags.verbose),
    r: $.switchOn(flags.recursive)
};

var longOptions = {
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "gunzip",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=gunzip.js.map
