"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_class_1 = require("./component.class");
/**
    A file component
*/
var FileComponent = (function (_super) {
    __extends(FileComponent, _super);
    function FileComponent(filename) {
        var _this = _super.call(this) || this;
        _this.type = FileComponent.type;
        _this.filename = filename;
        return _this;
    }
    return FileComponent;
}(component_class_1.Component));
FileComponent.type = "file";
exports.FileComponent = FileComponent;
