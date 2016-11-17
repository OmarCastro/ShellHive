"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
/*
-c, --count
              

       -d, --repeated
              only print duplicate lines

       -D, --all-repeated[=delimit-method]
              print  all  duplicate  lines  delimit-method={none(default),prepend,separate}
              Delimiting is done with blank lines

       -f, --skip-fields=N
              avoid comparing the first N fields

       -i, --ignore-case
              ignore differences in case when comparing

       -s, --skip-chars=N
              avoid comparing the first N characters

       -u, --unique
              only print unique lines

       -z, --zero-terminated
              end lines with 0 byte, not newline

       -w, --check-chars=N
              compare no more than N characters in lines



*/
var flags = {
    count: {
        name: "count",
        option: 'c',
        longOption: 'count',
        description: "prefix lines by the number of occurrences",
        active: false
    },
    ignoreCase: {
        name: "ignore case",
        option: 'd',
        longOption: 'delete',
        description: "delete characters in SET1, do not translate",
        active: false
    }
};
var config = {
    flags: flags,
};
var uniqData = new _common_imports_1.parserModule.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var shortOptions = optionsParser.shortOptions;
var UniqComponent = (function (_super) {
    __extends(UniqComponent, _super);
    function UniqComponent() {
        _super.apply(this, arguments);
        this.exec = "uniq";
    }
    return UniqComponent;
}(_common_imports_1.CommandComponent));
exports.UniqComponent = UniqComponent;
function defaultComponentData() {
    var component = new UniqComponent();
    component.selectors = uniqData.componentSelectors;
    component.flags = uniqData.componentFlags;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(uniqData.flagOptions, uniqData.selectorOptions, uniqData.parameterOptions);
exports.VisualSelectorOptions = uniqData.visualSelectorOptions;
exports.componentClass = UniqComponent;
