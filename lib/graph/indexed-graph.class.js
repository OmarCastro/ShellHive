"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IndexedGraph = (function () {
    function IndexedGraph(graph) {
        this.components = {};
        this.inputConnections = {};
        this.outputConnections = {};
        var components = this.components;
        var outputConnections = this.outputConnections;
        var inputConnections = this.inputConnections;
        graph.components.forEach(function (component) {
            components[component.id] = component;
        });
        graph.connections.forEach(function (connection) {
            outputConnections[connection.startNode] = connection;
            inputConnections[connection.endNode] = connection;
        });
    }
    return IndexedGraph;
}());
exports.IndexedGraph = IndexedGraph;
