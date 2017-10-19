"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setParameter(param) {
    var paramFn = function (Component, state, substate) {
        var parameter = substate.hasNext() ? substate.rest() : state.next();
        Component.parameters[param.name] = parameter;
        return true;
    };
    paramFn.ptype = 'param';
    paramFn.param = param.name;
    return paramFn;
}
exports.setParameter = setParameter;
;
