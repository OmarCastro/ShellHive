"use strict";
/**
 
*/
var Component = (function () {
    function Component() {
        this.position = { x: 0, y: 0 };
        this.id = 0;
    }
    Component.type = "abrstract component";
    return Component;
}());
exports.Component = Component;
