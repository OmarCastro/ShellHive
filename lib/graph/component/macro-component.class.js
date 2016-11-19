"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_class_1 = require("./component.class");
/**
  A macro Component
*/
var MacroComponent = (function (_super) {
    __extends(MacroComponent, _super);
    function MacroComponent(macro) {
        _super.call(this);
        this.macro = macro;
        this.type = MacroComponent.type;
    }
    MacroComponent.type = "macro";
    return MacroComponent;
}(component_class_1.Component));
exports.MacroComponent = MacroComponent;
