"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_class_1 = require("./component.class");
/**
   CommandComponent is responsible to provide information to create a view representing a command
*/
var CommandComponent = (function (_super) {
    __extends(CommandComponent, _super);
    function CommandComponent() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = CommandComponent.type;
        _this.exec = null;
        return _this;
    }
    return CommandComponent;
}(component_class_1.Component));
exports.CommandComponent = CommandComponent;
CommandComponent.type = "command";
