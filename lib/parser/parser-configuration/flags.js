"use strict";
/**
  activates flags (flags)
*/
function activateFlags() {
    var flags = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        flags[_i - 0] = arguments[_i];
    }
    var flagNames = flags.map(function (flag) { return (flag.name) ? flag.name : flag; });
    return function (component, state, substate) {
        flagNames.forEach(function (flagName) { return component.flags[flagName] = true; });
        return false;
    };
}
exports.activateFlags = activateFlags;
;
