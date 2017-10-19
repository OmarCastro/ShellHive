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
   CommandComponent is responsible to provide information to create a view representing a command
*/
var CommandComponent = (function (_super) {
    __extends(CommandComponent, _super);
    function CommandComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = CommandComponent.type;
        _this.exec = null;
        return _this;
    }
    CommandComponent.type = "command";
    return CommandComponent;
}(component_class_1.Component));
exports.CommandComponent = CommandComponent;
