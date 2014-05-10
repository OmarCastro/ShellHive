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

var flags = {
    complement: {
        name: "complement",
        option: 'c',
        longOption: 'show-tabs',
        description: "use SET1 complemet",
        active: false
    },
    delete: {
        name: "delete",
        option: 'd',
        longOption: 'delete',
        description: "delete characters in SET1, do not translate",
        active: false
    },
    squeeze: {
        name: "squeeze repeats",
        option: 's',
        longOption: 'squeeze-repeats',
        description: "replace each input sequence of a repeated character that is  listed  in  SET1 with a single occurrence of that character",
        active: false
    },
    truncate: {
        name: "truncate set1",
        option: 't',
        longOption: 'truncate-set1',
        description: "suppress repeated empty output lines",
        active: false
    }
};

var config = {
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);

var shortOptions = optionsParser.shortOptions;
shortOptions['C'] = $.switchOn(flags.complement);

var TrComponent = (function (_super) {
    __extends(TrComponent, _super);
    function TrComponent() {
        _super.apply(this, arguments);
        this.exec = "tr";
        this.set1 = "";
        this.set2 = "";
    }
    return TrComponent;
})(GraphModule.CommandComponent);
exports.TrComponent = TrComponent;

function defaultComponentData() {
    var component = new TrComponent();
    component.selectors = bzipData.componentSelectors;
    component.flags = bzipData.componentFlags;
    return component;
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        if (component.set1 == "") {
            component.set1 = str;
        } else {
            component.set2 = str;
        }
        ;
    }
});
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions, bzipData.parameterOptions, function (component, exec, flags, files) {
    return exec.concat(flags, component.set1, component.set2).join(' ');
});
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
exports.componentClass = TrComponent;
//# sourceMappingURL=tr.js.map
