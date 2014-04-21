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
    ratio: {
        name: 'ratio',
        description: 'compress ratio of the algorithm',
        options: {
            1: {
                name: '1 - fast',
                option: '1',
                longOption: 'fast',
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
                longOption: 'best',
                description: 'decompress the received data'
            }
        }
    }
};

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        longOption: 'keep',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        longOption: 'force',
        description: "overwrite existing output files",
        active: false
    },
    test: {
        name: "test",
        option: 't',
        longOption: 'test',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        longOption: 'stdout',
        description: "output to standard out",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        longOption: 'quiet',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        longOption: 'verbose',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        longOption: 'recursive',
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    small: {
        name: "small",
        longOption: 'small',
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var gzipData = new parserModule.ParserData(config);
var optionsParser = $.optionParserFromConfig(config);

var GZipComponent = (function (_super) {
    __extends(GZipComponent, _super);
    function GZipComponent() {
        _super.apply(this, arguments);
        this.exec = "gzip";
        this.files = [];
    }
    return GZipComponent;
})(GraphModule.CommandComponent);

function defaultComponentData() {
    var graph = new GZipComponent();
    graph.selectors = gzipData.componentSelectors;
    graph.flags = gzipData.componentFlags;
    return graph;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(gzipData.flagOptions, gzipData.selectorOptions);
exports.VisualSelectorOptions = gzipData.visualSelectorOptions;
//# sourceMappingURL=gzip.js.map
