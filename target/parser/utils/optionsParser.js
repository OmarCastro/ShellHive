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
        arg = longOptions[optionKey];
        if (!arg) {
            arg = longOptions[optionStr];
        }
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

exports.setParameter = function (param) {
    var paramFn = function (Component, state, substate) {
        var hasNext, parameter;
        hasNext = substate.hasNext();
        parameter = hasNext ? substate.rest() : state.next();
        Component.parameters[param] = parameter;
        return true;
    };
    paramFn;
    paramFn.ptype = 'param';
    paramFn.param = param;
    return paramFn;
};


function select(key, value) {
    if (key.name) {
        key = key.name;
    }
    if (value.name) {
        value = value.name;
    }
    return function (Component) {
        Component.selectors[key] = {
            type: "option",
            name: value
        };
    };
}
exports.select = select;
;

function ignore() {
}
exports.ignore = ignore;
;

exports.selectParameter = function (key, value) {
    var paramFn = function (Component, state, substate) {
        var parameselectParameterter;
        parameselectParameterter = substate.hasNext() ? substate.rest() : state.next();
        Component.selectors[key] = {
            parameterName: value,
            parameterValue: parameselectParameterter
        };
        return true;
    };
    paramFn;
    paramFn.ptype = 'param';
    return paramFn;
};

exports.selectIfUnselected = function (key, value) {
    var selections = [];
    for (var _i = 0; _i < (arguments.length - 2); _i++) {
        selections[_i] = arguments[_i + 2];
    }
    return function (Component) {
        var selectorValue = Component.selectors[key];
        if (selections.every(function (value) {
            return selectorValue !== value;
        })) {
            Component.selectors[key] = value;
        } else {
            return false;
        }
    };
};

exports.sameAs = function (option) {
    return ['same', option];
};

function generateSelectors(options) {
    var selectors = {};
    var selectorType = {};
    var selectorOptions = {};
    var VisualSelectorOptions = {};
    var subkey;
    var key;
    var subkeys;
    for (key in options) {
        subkeys = options[key];
        selectors[key] = key;
        var keySelectorType = selectorType[key] = {};
        var keySelectorOption = selectorOptions[key] = {};
        var VisualSelectorOption = VisualSelectorOptions[key] = [];
        for (subkey in subkeys) {
            var value = subkeys[subkey];
            keySelectorType[subkey.replace(" ", "_")] = subkey;
            keySelectorOption[subkey] = value;
            VisualSelectorOption.push(value);
        }
    }
    return {
        selectors: selectors,
        selectorType: selectorType,
        selectorOptions: selectorOptions,
        VisualSelectorOptions: VisualSelectorOptions
    };
}
exports.generateSelectors = generateSelectors;
;

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
//# sourceMappingURL=optionsParser.js.map
