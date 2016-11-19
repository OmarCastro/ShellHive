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
var GraphComponent = (function (_super) {
    __extends(GraphComponent, _super);
    function GraphComponent(name, description) {
        _super.call(this);
        this.name = name;
        this.description = description;
        this.type = GraphComponent.type;
        this.entryComponent = null;
        this.exitComponent = null;
        this.counter = 0;
        this.components = [];
        this.connections = [];
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
