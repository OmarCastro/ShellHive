"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iterator_class_1 = require("../utils/iterator.class");
function parseShortOptions(options, componentData, argsNodeIterator) {
    var shortOptions = options.shortOptions;
    var iter = new iterator_class_1.Iterator(argsNodeIterator.current.slice(1));
    while (iter.hasNext()) {
        var option = iter.next();
        var arg = shortOptions[option];
        if (arg && arg(componentData, argsNodeIterator, iter)) {
            break;
        }
    }
}
exports.parseShortOptions = parseShortOptions;
