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
var zcatData = new _common_imports_1.parserModule.ParserData(config);
var ZcatComponent = (function (_super) {
    __extends(ZcatComponent, _super);
    function ZcatComponent() {
        _super.apply(this, arguments);
        this.exec = "zcat";
        this.files = [];
    }
    return ZcatComponent;
}(_common_imports_1.CommandComponent));
exports.ZcatComponent = ZcatComponent;
function defaultComponentData() {
    var component = new ZcatComponent();
    component.selectors = zcatData.componentSelectors;
    component.flags = zcatData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(zcatData.flagOptions, zcatData.selectorOptions);
exports.VisualSelectorOptions = zcatData.visualSelectorOptions;
exports.componentClass = ZcatComponent;
