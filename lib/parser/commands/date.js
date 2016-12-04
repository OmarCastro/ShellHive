"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _common_imports_1 = require("./_common.imports");
var config = {
    parameters: {
        date: {
            name: 'date',
            option: 'd',
            type: "string",
            description: "filter entries by anything other than the content",
            defaultValue: ""
        }
    },
    flags: {
        utc: {
            name: "UTC",
            option: 'u',
            longOption: ['utc', 'universal'],
            description: "overwrite existing output files",
            active: false
        }
    }
};
var dateData = new _common_imports_1.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
optionsParser.shortOptions['d'] = _common_imports_1.$.setParameter(config.parameters.date);
optionsParser.longOptions['date'] = optionsParser.shortOptions['d'];
var DateComponent = (function (_super) {
    __extends(DateComponent, _super);
    function DateComponent() {
        var _this = _super.apply(this, arguments) || this;
        _this.exec = "date";
        return _this;
    }
    return DateComponent;
}(_common_imports_1.CommandComponent));
exports.DateComponent = DateComponent;
function defaultComponentData() {
    var component = new DateComponent();
    component.flags = dateData.componentFlags;
    component.parameters = dateData.componentParameters;
    return component;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) { component.parameters.date = str; }
});
exports.parseComponent = _common_imports_1.common.commonParseComponent(dateData.flagOptions, dateData.selectorOptions, dateData.parameterOptions);
exports.visualSelectorOptions = dateData.visualSelectorOptions;
exports.componentClass = DateComponent;
/*DESCRIPTION
       Display the current time in the given FORMAT, or set the system date.

       -d, --date=STRING
              display time described by STRING, not 'now'

       -f, --file=DATEFILE
              like --date once for each line of DATEFILE

       -I[TIMESPEC], --iso-8601[=TIMESPEC]
              output date/time in ISO 8601 format.  TIMESPEC='date' for date only (the default), 'hours', 'minutes', 'seconds', or 'ns' for date and time to the indicated precision.

       -r, --reference=FILE
              display the last modification time of FILE

       -R, --rfc-2822
              output date and time in RFC 2822 format.  Example: Mon, 07 Aug 2006 12:34:56 -0600

       --rfc-3339=TIMESPEC
              output date and time in RFC 3339 format.  TIMESPEC='date', 'seconds', or 'ns' for date and time to the indicated precision.  Date and time components are separated by a sin‐
              gle space: 2006-08-07 12:34:56-06:00

       -s, --set=STRING
              set time described by STRING

       -u, --utc, --universal
              print or set Coordinated Universal Time

       --help display this help and exit

       --version
              output version information and exit
*/ 
