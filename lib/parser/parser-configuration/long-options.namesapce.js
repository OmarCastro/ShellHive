"use strict";
var iterator_class_1 = require("../utils/iterator.class");
function parseLongOptions(options, componentData, argsNodeIterator) {
    var longOptions = options.longOptions;
    var optionStr = argsNodeIterator.current.slice(2);
    var indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
        var iter = new iterator_class_1.Iterator(optionStr);
        iter.index = indexOfSep + 1;
        var optionKey = optionStr.slice(0, indexOfSep);
        var arg = longOptions[optionKey] || longOptions[optionStr];
        if (arg) {
            return arg(componentData, argsNodeIterator, iter);
        }
    }
    else {
        var arg = longOptions[optionStr];
        if (arg) {
            return arg(componentData, null, null);
        }
    }
}
exports.parseLongOptions = parseLongOptions;
