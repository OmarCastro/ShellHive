"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
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
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var gunzipData = new _common_imports_1.ParserData(config);
;
var GunzipComponent = (function (_super) {
    __extends(GunzipComponent, _super);
    function GunzipComponent() {
        _super.apply(this, arguments);
        this.exec = "gunzip";
        this.files = [];
    }
    return GunzipComponent;
}(_common_imports_1.CommandComponent));
exports.GunzipComponent = GunzipComponent;
function defaultComponentData() {
    var component = new GunzipComponent();
    component.selectors = gunzipData.componentSelectors;
    component.flags = gunzipData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(gunzipData.flagOptions, gunzipData.selectorOptions);
exports.VisualSelectorOptions = gunzipData.visualSelectorOptions;
exports.componentClass = GunzipComponent;
