"use strict";
var iterator_class_1 = require("./iterator.class");
function parseShortOptions(options, componentData, argsNodeIterator) {
    var option, shortOptions = options.shortOptions, iter = new iterator_class_1.Iterator(argsNodeIterator.current.slice(1));
    while (option = iter.next()) {
        var arg = shortOptions[option];
        if (arg && arg(componentData, argsNodeIterator, iter)) {
            break;
        }
    }
}
exports.parseShortOptions = parseShortOptions;
