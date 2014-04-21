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
    ratio: {
        name: 'ratio',
        description: 'compress ratio of the algorithm',
        options: {
            1: {
                name: '1 - fast',
                option: '1',
                description: 'compress the received data'
            },
            2: {
                name: '2',
                option: '2',
                description: 'decompress the received data'
            },
            3: {
                name: '3',
                option: '3',
                description: 'decompress the received data'
            },
            4: {
                name: '4',
                option: '4',
                description: 'decompress the received data'
            },
            5: {
                name: '5',
                option: '5',
                description: 'decompress the received data'
            },
            6: {
                name: '6',
                option: '6',
                description: 'decompress the received data',
                default: true
            },
            7: {
                name: '7',
                option: '7',
                description: 'decompress the received data'
            },
            8: {
                name: '8',
                option: '8',
                description: 'decompress the received data'
            },
            9: {
                name: '9 - best',
                option: '9',
                description: 'decompress the received data'
            }
        }
    }
};

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
    recursive: {
        name: "recursive",
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
    k: $.switchOn(flags.keep),
    f: $.switchOn(flags.force),
    t: $.switchOn(flags.test),
    c: $.switchOn(flags.stdout),
    q: $.switchOn(flags.quiet),
    v: $.switchOn(flags.verbose),
    r: $.switchOn(flags.recursive),
    s: $.switchOn(flags.small),
    1: $.select(selectors.ratio, selectors.ratio.options[1]),
    2: $.select(selectors.ratio, selectors.ratio.options[2]),
    3: $.select(selectors.ratio, selectors.ratio.options[3]),
    4: $.select(selectors.ratio, selectors.ratio.options[4]),
    5: $.select(selectors.ratio, selectors.ratio.options[5]),
    6: $.select(selectors.ratio, selectors.ratio.options[6]),
    7: $.select(selectors.ratio, selectors.ratio.options[7]),
    8: $.select(selectors.ratio, selectors.ratio.options[8]),
    9: $.select(selectors.ratio, selectors.ratio.options[9])
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
    return {
        type: 'command',
        exec: "gzip",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=gzip.js.map
