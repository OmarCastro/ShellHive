/*
-d   If given, decompression is done instead.
-c   Write output on stdout, don't remove original.
-b   Parameter limits the max number of bits/code.
-f   Forces output file to be generated, even if one already.
exists, and even if no space is saved by compressing.
If -f is not used, the user will be prompted if stdin is.
a tty, otherwise, the output file will not be overwritten.
-v   Write compression statistics.
-V   Output vesion and compile options.
-r   Recursive. If a filename is a directory, descend
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

var flags = {
    // keep: {
    //   name: "keep files",
    //   option: 'k',
    //   description: "keep (don't delete) input files",
    //   active: false
    // },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    decompress: {
        name: "decompress",
        option: 'd',
        description: "decompress instead of compress",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
        active: false
    },
    // quiet: {
    //   name: "quiet",
    //   option: 'q',
    //   longOption: 'quiet',
    //   description: "suppress noncritical error messages",
    //   active: false
    // },
    statistics: {
        name: "statistics",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        option: 'r',
        description: "Recursive. If a filename is a directory, descend",
        active: false
    }
};

var config = {
    flags: flags
};

var gzipData = new parserModule.ParserData(config);
var optionsParser = $.optionParserFromConfig(config);

var CompressComponent = (function (_super) {
    __extends(CompressComponent, _super);
    function CompressComponent() {
        _super.apply(this, arguments);
        this.exec = "compress";
        this.files = [];
    }
    return CompressComponent;
})(GraphModule.CommandComponent);
exports.CompressComponent = CompressComponent;

function defaultComponentData() {
    var component = new CompressComponent();
    component.selectors = gzipData.componentSelectors;
    component.flags = gzipData.componentFlags;
    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(gzipData.flagOptions, gzipData.selectorOptions);
exports.VisualSelectorOptions = gzipData.visualSelectorOptions;
exports.componentClass = CompressComponent;
