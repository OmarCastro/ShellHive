"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var component_class_1 = require("./component.class");
/**
  A macro Component
*/
var MacroComponent = (function (_super) {
    __extends(MacroComponent, _super);
    function MacroComponent(macro) {
        var _this = _super.call(this) || this;
        _this.macro = macro;
        _this.type = MacroComponent.type;
        return _this;
    }
    MacroComponent.type = "macro";
    return MacroComponent;
}(component_class_1.Component));
exports.MacroComponent = MacroComponent;
