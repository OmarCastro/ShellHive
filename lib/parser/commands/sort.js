"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
var nullstr = null;
var selectors = {
    action: {
        name: 'action',
        description: 'action to exectute',
        options: {
            sort: {
                name: 'sort',
                option: nullstr,
                description: 'sort',
                defaut: true
            },
            check: {
                name: 'check',
                option: 'c',
                description: 'sort by number'
            },
            silentCheck: {
                name: 'quiet check',
                option: 'g',
                description: 'print line numbers on all lines'
            },
            merge: {
                name: 'merge files',
                option: 'm',
                description: 'print line numbers on all lines'
            }
        }
    },
    sort: {
        name: 'sort',
        description: 'sort according to option',
        options: {
            text: {
                name: 'text',
                option: nullstr,
                description: 'sort by text',
                defaut: true
            },
            numeric: {
                name: 'numeric',
                option: 'n',
                description: 'sort by number'
            },
            generalNumeric: {
                name: 'general numeric',
                option: 'g',
                description: 'print line numbers on all lines'
            },
            humanNumeric: {
                name: 'human numeric',
                option: 'h',
                description: 'print line numbers on non empty lines'
            },
            Month: {
                name: 'month',
                option: 'M',
                description: 'print line numbers on non empty lines'
            },
            random: {
                name: 'random',
                option: 'R',
                description: 'print line numbers on non empty lines'
            },
            version: {
                name: 'version',
                option: 'V',
                description: 'print line numbers on non empty lines'
            }
        }
    }
};
var flags = {
    reverse: {
        name: "reverse",
        option: 'r',
        description: "print TAB characters like ^I",
        active: false
    },
    unique: {
        name: "unique",
        option: 'u',
        description: "suppress repeated empty output lines",
        active: false
    },
    ignoreCase: {
        name: "ignore case",
        option: 'E',
        description: "print $ after each line",
        active: false
    },
    ignoreNonprinting: {
        name: "ignore non-printing chars",
        option: 'v',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    ignoreLeadingBlanks: {
        name: "ignore leading blanks",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    }
};
var parameters = {
    key: {
        name: 'key',
        option: 'k',
        type: "string",
        description: "sort via a key",
        defaultValue: ""
    }
};
var config = {
    selectors: selectors,
    flags: flags,
    parameters: parameters
};
var sortData = new _common_imports_1.ParserData(config);
var shortOptions = {
    b: _common_imports_1.$.switchOn(flags.ignoreLeadingBlanks),
    d: _common_imports_1.$.ignore,
    f: _common_imports_1.$.switchOn(flags.ignoreCase),
    g: _common_imports_1.$.select(selectors.sort, selectors.sort.options.generalNumeric),
    i: _common_imports_1.$.switchOn(flags.ignoreNonprinting),
    M: _common_imports_1.$.select(selectors.sort, selectors.sort.options.Month),
    h: _common_imports_1.$.select(selectors.sort, selectors.sort.options.humanNumeric),
    n: _common_imports_1.$.select(selectors.sort, selectors.sort.options.numeric),
    R: _common_imports_1.$.select(selectors.sort, selectors.sort.options.random),
    r: _common_imports_1.$.switchOn(flags.reverse),
    V: _common_imports_1.$.select(selectors.sort, selectors.sort.options.version),
    c: _common_imports_1.$.select(selectors.action, selectors.action.options.check),
    C: _common_imports_1.$.select(selectors.action, selectors.action.options.silentCheck),
    k: _common_imports_1.$.setParameter(parameters.key),
    m: _common_imports_1.$.select(selectors.action, selectors.action.options.merge),
    o: _common_imports_1.$.ignore,
    s: _common_imports_1.$.ignore,
    S: _common_imports_1.$.ignore,
    t: _common_imports_1.$.ignore,
    T: _common_imports_1.$.ignore,
    u: _common_imports_1.$.switchOn(flags.unique),
    z: _common_imports_1.$.ignore,
};
var longOptions = {
    "ignore-leading-blanks": shortOptions.b,
    "dictionary-order": _common_imports_1.$.ignore,
    "ignore-case": shortOptions.f,
    "general-numeric": shortOptions.g,
    "ignore-nonprinting": shortOptions.i,
    "month-sort": shortOptions.M,
    "human-numeric-sort": shortOptions.h,
    "numeric-sort": shortOptions.n,
    "unique": shortOptions.u
};
var optionsParser = { shortOptions: shortOptions, longOptions: longOptions };
var SortComponent = (function (_super) {
    __extends(SortComponent, _super);
    function SortComponent() {
        _super.apply(this, arguments);
        this.exec = "sort";
        this.files = [];
    }
    return SortComponent;
}(_common_imports_1.CommandComponent));
exports.SortComponent = SortComponent;
function defaultComponentData() {
    var component = new SortComponent();
    component.selectors = sortData.componentSelectors;
    component.flags = sortData.componentFlags;
    component.parameters = sortData.componentParameters;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(sortData.flagOptions, sortData.selectorOptions, sortData.parameterOptions);
exports.VisualSelectorOptions = sortData.visualSelectorOptions;
exports.componentClass = SortComponent;
