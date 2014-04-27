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
var parserModule = require("../utils/parserData");
var common = require("./_init");
var GraphModule = require("../../common/graph");

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
    }
};

var config = {
    flags: flags
};

var optionsParser = $.optionParserFromConfig(config);
var gunzipData = new parserModule.ParserData(config);

$.generate(optionsParser);

var GunzipComponent = (function (_super) {
    __extends(GunzipComponent, _super);
    function GunzipComponent() {
        _super.apply(this, arguments);
        this.exec = "gunzip";
        this.files = [];
    }
    return GunzipComponent;
})(GraphModule.CommandComponent);
exports.GunzipComponent = GunzipComponent;

function defaultComponentData() {
    var component = new GunzipComponent();
    component.selectors = gunzipData.componentSelectors;
    component.flags = gunzipData.componentFlags;
    return component;
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(gunzipData.flagOptions, gunzipData.selectorOptions);
exports.VisualSelectorOptions = gunzipData.visualSelectorOptions;
exports.componentClass = GunzipComponent;
//# sourceMappingURL=gunzip.js.map
