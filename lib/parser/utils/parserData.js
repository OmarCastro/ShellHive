/**
CompilerData gives information to be used
to compile the AST to a data repersentation
of a command
There are 6 types of options
simple string:
a simple argument, each command treats them differently
selection:
there exists a list of arguments that the command will choose
one of them to use, if no selection argument is added the command uses the default one
parameters:
an argument that includes a parameter
numeric paramters:
an argument that includes a parameter that is limited to numbers
selection with parameters:
a selection argument which one or more of them is a parameter
flags:
a flag in the command
*/
var ParserData = (function () {
    function ParserData(config) {
        this.selectors = {};
        this.selectorOptions = {};
        this.visualSelectorOptions = {};
        this.parameterOptions = {};
        this.shortOptions = {};
        this.longOptions = {};
        this.flagOptions = {};
        this.setFlags(config.flags);
        this.setParameters(config.parameters);
        this.setSelector(config.selectors);
    }
    ParserData.prototype.setFlags = function (flags) {
        if (typeof flags === "undefined") { flags = {}; }
        this.flags = flags;
        var flagOptions = (this.flagOptions = {});
        for (var key in flags) {
            var value = flags[key];
            flagOptions[value.name] = value.option;
        }
    };

    ParserData.prototype.setParameters = function (parameters) {
        if (typeof parameters === "undefined") { parameters = {}; }
        this.parameters = parameters;
        var parameterOptions = this.parameterOptions;
        for (var key in parameters) {
            var value = parameters[key];
            parameterOptions[value.name] = value.option;
        }
    };

    /**
    Generates data to be used in selection tasks
    */
    ParserData.prototype.setSelector = function (selectorData) {
        if (typeof selectorData === "undefined") { selectorData = {}; }
        this.selectorData = selectorData;
        var selectors = this.selectors;
        var selectorOptions = this.selectorOptions;
        var visualSelectorOptions = this.visualSelectorOptions;
        var regexToReplace = / /g;

        for (var key in selectorData) {
            var subkeys = selectorData[key];
            var keySelector = selectors[subkeys.name] = {};
            var keySelectorOption = selectorOptions[subkeys.name] = {};
            var VisualSelectorOption = visualSelectorOptions[subkeys.name] = [];

            for (var subkey in subkeys.options) {
                var value = subkeys.options[subkey];
                keySelector[value.name] = value;
                keySelectorOption[value.name] = value.option;
                VisualSelectorOption.push(value.name);
            }
        }

        visualSelectorOptions.$selector = selectors;
        return this;
    };

    Object.defineProperty(ParserData.prototype, "componentFlags", {
        /**
        Sets the options for the normal options
        of a command, normally a one character option
        */
        //public setShortOptions(options){
        //  this.shortOptions = options
        //}
        /**
        Sets the options for the long variants of the options
        of a command, normally a an argument prefixed with 2
        hypens
        */
        //public setLongOptions(options){
        //  this.longOptions = options
        //}
        get: function () {
            var componentFlags = {};
            var flags = this.flags;
            for (var key in flags) {
                var value = flags[key];
                componentFlags[value.name] = value.active;
            }
            return componentFlags;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(ParserData.prototype, "componentSelectors", {
        get: function () {
            var componentSelectors = {};
            var selectorData = this.selectorData;
            for (var key in selectorData) {
                var value = selectorData[key];
                for (var optionName in value.options) {
                    var option = value.options[optionName];
                    if (option.default) {
                        var valueObj = {
                            name: option.name,
                            type: option.type || "option"
                        };
                        if (option.defaultValue) {
                            valueObj['value'] = option.defaultValue;
                        }
                        componentSelectors[value.name] = valueObj;
                        break;
                    }
                }
            }
            return componentSelectors;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(ParserData.prototype, "componentParameters", {
        get: function () {
            var componentParameters = {};
            var parameters = this.parameters;
            for (var key in parameters) {
                var value = parameters[key];
                componentParameters[value.name] = value.defaultValue || "";
            }
            return componentParameters;
        },
        enumerable: true,
        configurable: true
    });
    return ParserData;
})();
exports.ParserData = ParserData;

(function (SelectorOptionType) {
    SelectorOptionType[SelectorOptionType["OPTION"] = 0] = "OPTION";
    SelectorOptionType[SelectorOptionType["PARAMETER"] = 1] = "PARAMETER";
    SelectorOptionType[SelectorOptionType["NUMERIC_PARAMETER"] = 2] = "NUMERIC_PARAMETER";
})(exports.SelectorOptionType || (exports.SelectorOptionType = {}));
var SelectorOptionType = exports.SelectorOptionType;
