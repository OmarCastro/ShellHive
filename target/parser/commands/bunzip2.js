/*
-d --decompress     force decompression
-z --compress       force compression
-k --keep           keep (don't delete) input files
-f --force          overwrite existing output files
-t --test           test compressed file integrity
-c --stdout         output to standard out
-q --quiet          suppress noncritical error messages
-v --verbose        be verbose (a 2nd -v gives more)
-s --small          use less memory (at most 2500k)
-1 .. -9            set block size to 100k .. 900k
--fast              alias for -1
--best              alias for -9
*/
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    action: {
        name: 'action',
        description: 'action of the algorithm',
        options: {
            compress: {
                name: 'compress',
                option: 'z',
                description: 'compress the received data'
            },
            decompress: {
                name: 'decompress',
                option: null,
                description: 'decompress the received data'
            }
        }
    }
};

var actionOptions = selectors.action.options;

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
    test: {
        name: "test",
        option: 't',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
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
    small: {
        name: "small",
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    d: $.select(selectors.action.name, actionOptions.decompress.name),
    z: $.select(selectors.action.name, actionOptions.compress.name),
    k: $.switchOn(flags.keep.name),
    f: $.switchOn(flags.force.name),
    t: $.switchOn(flags.test.name),
    c: $.switchOn(flags.stdout.name),
    q: $.switchOn(flags.quiet.name),
    v: $.switchOn(flags.verbose.name),
    s: $.switchOn(flags.small.name),
    1: $.ignore,
    2: $.ignore,
    3: $.ignore,
    4: $.ignore,
    5: $.ignore,
    6: $.ignore,
    7: $.ignore,
    8: $.ignore,
    9: $.ignore
};

var longOptions = {
    'decompress': $.sameAs('d'),
    'compress': $.sameAs('z'),
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'stdout': $.sameAs('c'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v'),
    'small': $.sameAs('s'),
    'fast': $.sameAs('1'),
    'best': $.sameAs('9')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    var componentFlags = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    return {
        type: 'command',
        exec: "bunzip2",
        flags: componentFlags,
        selectors: {
            action: selectors.action.options.decompress.name
        },
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=bunzip2.js.map
