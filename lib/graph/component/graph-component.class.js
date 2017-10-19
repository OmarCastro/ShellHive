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
var GraphComponent = (function (_super) {
    __extends(GraphComponent, _super);
    function GraphComponent(name, description) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.description = description;
        _this.type = GraphComponent.type;
        _this.entryComponent = null;
        _this.exitComponent = null;
        _this.counter = 0;
        _this.components = [];
        _this.connections = [];
        return _this;
    }
    GraphComponent.prototype.setGraphData = function (graphData) {
        this.components = graphData.components;
        this.connections = graphData.connections;
        this.entryComponent = graphData.firstMainComponent;
    };
    GraphComponent.type = "graph";
    return GraphComponent;
}(component_class_1.Component));
exports.GraphComponent = GraphComponent;
