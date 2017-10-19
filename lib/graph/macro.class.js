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
var graph_class_1 = require("./graph.class");
/**
  A macro is responsible to make a represntation of a component that is a wrapper
  of a sequence of commands represented by a graph, the purpose of a macro is to
  allows not the reusability of components, making the resulting graph more consice
*/
var Macro = (function (_super) {
    __extends(Macro, _super);
    function Macro(name, description) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.description = description;
        return _this;
    }
    Macro.fromGraph = function (name, description, graphData) {
        var newmacro = new Macro(name, description);
        newmacro.components = graphData.components;
        newmacro.connections = graphData.connections;
        return newmacro;
    };
    return Macro;
}(graph_class_1.Graph));
exports.Macro = Macro;
