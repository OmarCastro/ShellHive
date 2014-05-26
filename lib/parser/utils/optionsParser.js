var Iterator = (function () {
    function Iterator(ArgList) {
        this.index = 0;
        this.argList = ArgList;
        this.length = ArgList.length;
        this.current = ArgList[0];
    }
    Iterator.prototype.hasNext = function () {
        return this.index !== this.length;
    };
    Iterator.prototype.next = function () {
        return this.current = this.argList[this.index++];
    };
    Iterator.prototype.rest = function () {
        return this.argList.slice(this.index);
    };
    return Iterator;
})();
exports.Iterator = Iterator;

function parseShortOptions(options, componentData, argsNodeIterator) {
    var option, shortOptions = options.shortOptions, iter = new Iterator(argsNodeIterator.current.slice(1));
    while (option = iter.next()) {
        var arg = shortOptions[option];
        if (arg && arg(componentData, argsNodeIterator, iter)) {
            break;
        }
    }
}
exports.parseShortOptions = parseShortOptions;

exports.parseLongOptions = function (options, componentData, argsNodeIterator) {
    var longOptions, optionStr, indexOfSep, iter, optionKey, arg;
    longOptions = options.longOptions;
    optionStr = argsNodeIterator.current.slice(2);
    indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
        iter = new Iterator(optionStr);
        iter.index = indexOfSep + 1;
        optionKey = optionStr.slice(0, indexOfSep);
        arg = longOptions[optionKey] || longOptions[optionStr];
        if (arg) {
            return arg(componentData, argsNodeIterator, iter);
        }
    } else {
        arg = longOptions[optionStr];
        if (arg) {
            return arg(componentData);
        }
    }
};

/**
activates flags (flags)
*/
exports.switchOn = function () {
    var flags = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        flags[_i] = arguments[_i + 0];
    }
    flags = flags.map(function (flag) {
        return (flag.name) ? flag.name : flag;
    });
    return function (Component, state, substate) {
        flags.forEach(function (flag) {
            Component.flags[flag] = true;
        });
        return false;
    };
};

/**
set parameter (param)
*/
exports.setParameter = function (param) {
    var paramFn = function (Component, state, substate) {
        var hasNext = substate.hasNext();
        var parameter = hasNext ? substate.rest() : state.next();
        Component.parameters[param] = parameter;
        return true;
    };
    paramFn;
    paramFn.ptype = 'param';
    paramFn.param = param;
    return paramFn;
};


function select(key, value, type) {
    if (typeof type === "undefined") { type = "option"; }
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
    } else if (type == "numeric parameter") {
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
    for (var _i = 0; _i < (arguments.length - 2); _i++) {
        selections[_i] = arguments[_i + 2];
    }
    if (key.name) {
        key = key.name;
    }
    if (value.name) {
        value = value.name;
    }
    selections = selections.map(function (val) {
        return val.name || val;
    });
    return function (Component) {
        var selectorValue = Component.selectors[key].name;
        if (selections.every(function (value) {
            return selectorValue !== value;
        })) {
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
function ignore() {
}
exports.ignore = ignore;
;

exports.sameAs = function (option) {
    return ['same', option];
};

function generate(parser) {
    var key, val;
    var longOptions = parser.longOptions, shortOptions = parser.shortOptions;
    for (key in longOptions) {
        val = longOptions[key];
        if (val[0] === 'same') {
            longOptions[key] = shortOptions[val[1]];
        }
    }
}
exports.generate = generate;

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
                flag.longOption.forEach(function (option) {
                    return longOptions[option] = opt;
                });
            } else {
                longOptions[flag.longOption] = opt;
            }
        }
    }
    for (var key in config.selectors || {}) {
        var selector = config.selectors[key];
        var options = selector.options;
        for (var optionkey in options) {
            var option = options[optionkey];
            opt = exports.select(selector, option, option.type);
            if (option.option) {
                if (option.option[0] === "-") {
                    longOptions[option.option.slice(2)] = opt;
                } else {
                    shortOptions[option.option] = opt;
                }
            }
            if (option.longOption) {
                if (option.longOption instanceof Array) {
                    option.longOption.forEach(function (option) {
                        return longOptions[option] = opt;
                    });
                } else {
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
