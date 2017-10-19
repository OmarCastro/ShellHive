"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var short_options_namesapce_1 = require("./short-options.namesapce");
exports.parseShortOptions = short_options_namesapce_1.parseShortOptions;
var long_options_namesapce_1 = require("./long-options.namesapce");
exports.parseLongOptions = long_options_namesapce_1.parseLongOptions;
var parameters_fn_1 = require("./parameters.fn");
exports.setParameter = parameters_fn_1.setParameter;
var flags_1 = require("./flags");
/**
  activates flags (flags)
*/
exports.switchOn = flags_1.activateFlags;
function select(key, value, type) {
    if (type === void 0) { type = "option"; }
    if (key.name) {
        key = key.name;
    }
    if (value.name) {
        value = value.name;
    }
    if (type == "option") {
        return function (Component) {
            Component.selectors[key] = {
                type: type,
                name: value
            };
        };
    }
    else if (type == "numeric parameter") {
        return function (Component, state, substate) {
            var parameter = substate.hasNext() ? substate.rest() : state.next();
            Component.selectors[key] = {
                type: type,
                name: value,
                value: +parameter
            };
        };
    }
}
exports.select = select;
;
exports.selectIfUnselected = function (key, value) {
    var selections = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        selections[_i - 2] = arguments[_i];
    }
    if (key.name) {
        key = key.name;
    }
    if (value.name) {
        value = value.name;
    }
    selections = selections.map(function (val) { return val.name || val; });
    return function (Component) {
        var selectorValue = Component.selectors[key].name;
        if (selections.every(function (value) { return selectorValue !== value; })) {
            Component.selectors[key] = {
                type: "option",
                name: value
            };
        }
    };
};
/**
  function to ignore errors when using this option
*/
function ignore() { return function () { }; }
exports.ignore = ignore;
;
function optionParserFromConfig(config) {
    var longOptions = {};
    var shortOptions = {};
    var opt;
    for (var key in config.flags || {}) {
        var flag = config.flags[key];
        opt = exports.switchOn(flag);
        shortOptions[flag.option] = opt;
        if (flag.longOption) {
            if (flag.longOption instanceof Array) {
                flag.longOption.forEach(function (option) { return longOptions[option] = opt; });
            }
            else {
                longOptions[flag.longOption] = opt;
            }
        }
    }
    for (var key in config.selectors || {}) {
        var selector = config.selectors[key];
        var options = selector.options;
        for (var optionkey in options) {
            var option = options[optionkey];
            opt = select(selector, option, option.type);
            if (option.option) {
                if (option.option[0] === "-") {
                    longOptions[option.option.slice(2)] = opt;
                }
                else {
                    shortOptions[option.option] = opt;
                }
            }
            if (option.longOption) {
                if (option.longOption instanceof Array) {
                    option.longOption.forEach(function (option) { return longOptions[option] = opt; });
                }
                else {
                    longOptions[option.longOption] = opt;
                }
            }
        }
    }
    return {
        longOptions: longOptions,
        shortOptions: shortOptions
    };
}
exports.optionParserFromConfig = optionParserFromConfig;
