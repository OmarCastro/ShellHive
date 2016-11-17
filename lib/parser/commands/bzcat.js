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
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
var selectors = {
    action: {
        name: 'action',
        description: 'action of the algorithm',
        options: {
            compress: {
                name: 'compress',
                option: null,
                description: 'compress the received data'
            },
            decompress: {
                name: 'decompress',
                option: 'd',
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
        active: true
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
var bzipData = new _common_imports_1.parserModule.ParserData(config);
var shortOptions = {
    d: _common_imports_1.$.select(selectors.action.name, actionOptions.decompress.name),
    z: _common_imports_1.$.select(selectors.action.name, actionOptions.compress.name),
    k: _common_imports_1.$.switchOn(flags.keep.name),
    f: _common_imports_1.$.switchOn(flags.force.name),
    t: _common_imports_1.$.switchOn(flags.test.name),
    c: _common_imports_1.$.switchOn(flags.stdout.name),
    q: _common_imports_1.$.switchOn(flags.quiet.name),
    v: _common_imports_1.$.switchOn(flags.verbose.name),
    s: _common_imports_1.$.switchOn(flags.small.name),
    1: _common_imports_1.$.ignore,
    2: _common_imports_1.$.ignore,
    3: _common_imports_1.$.ignore,
    4: _common_imports_1.$.ignore,
    5: _common_imports_1.$.ignore,
    6: _common_imports_1.$.ignore,
    7: _common_imports_1.$.ignore,
    8: _common_imports_1.$.ignore,
    9: _common_imports_1.$.ignore,
};
var longOptions = {
    'decompress': _common_imports_1.$.sameAs('d'),
    'compress': _common_imports_1.$.sameAs('z'),
    'keep': _common_imports_1.$.sameAs('k'),
    'force': _common_imports_1.$.sameAs('f'),
    'test': _common_imports_1.$.sameAs('t'),
    'stdout': _common_imports_1.$.sameAs('c'),
    'quiet': _common_imports_1.$.sameAs('q'),
    'verbose': _common_imports_1.$.sameAs('v'),
    'small': _common_imports_1.$.sameAs('s'),
    'fast': _common_imports_1.$.sameAs('1'),
    'best': _common_imports_1.$.sameAs('9')
};
var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};
_common_imports_1.$.generate(optionsParser);
var BzcatComponent = (function (_super) {
    __extends(BzcatComponent, _super);
    function BzcatComponent() {
        _super.apply(this, arguments);
        this.exec = "bzcat";
        this.files = [];
    }
    return BzcatComponent;
}(_common_imports_1.CommandComponent));
exports.BzcatComponent = BzcatComponent;
function defaultComponentData() {
    var component = new BzcatComponent();
    component.selectors = bzipData.componentSelectors;
    component.flags = bzipData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
exports.componentClass = BzcatComponent;
