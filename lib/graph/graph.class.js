"use strict";
var connection_class_1 = require("./connection.class");
var Graph = (function () {
    function Graph(components, connections, firstMainComponent, counter) {
        if (components === void 0) { components = []; }
        if (connections === void 0) { connections = []; }
        if (firstMainComponent === void 0) { firstMainComponent = null; }
        if (counter === void 0) { counter = 0; }
        this.components = components;
        this.connections = connections;
        this.firstMainComponent = firstMainComponent;
        this.counter = counter;
    }
    /**
        transforms to JSON, JSON.stringify() will
        call this function if it exists
    */
    Graph.prototype.toJSON = function () {
        return {
            components: this.components,
            connections: this.connections,
        };
    };
    /**
      in graph
    */
    Graph.prototype.containsComponent = function (target) {
        return this.components.some(function (component) { return component == target; });
    };
    /*
      removes the component of the graph and returns the connections related to it
    */
    Graph.prototype.removeComponent = function (component) {
        if (this.containsComponent(component)) {
            if (component == this.firstMainComponent) {
                this.firstMainComponent = null;
            }
            var returnlist_1 = [];
            var filteredlist_1 = [];
            this.connections.forEach(function (connection) {
                if (connection.startComponent == component || connection.endComponent == component) {
                    returnlist_1.push(connection);
                }
                else {
                    filteredlist_1.push(connection);
                }
            });
            this.components.splice(this.components.indexOf(component), 1);
            this.connections = filteredlist_1;
            return returnlist_1;
        }
        return null;
    };
    Graph.prototype.connect = function (startComponent, outputPort, endComponent, inputPort) {
        var connection = new connection_class_1.Connection(startComponent, outputPort, endComponent, inputPort);
        this.connections.push(connection);
    };
    /*
        expands with other graph
    */
    Graph.prototype.expand = function (other) {
        this.concatComponents(other.components);
        this.concatConnections(other.connections);
        //if(this.counter){
        //  other.components.forEach(component => {
        //    component.id = this.counter++;
        //  });
        //}
    };
    Graph.prototype.concatComponents = function (components) { this.components = this.components.concat(components); };
    Graph.prototype.concatConnections = function (connections) { this.connections = this.connections.concat(connections); };
    return Graph;
}());
exports.Graph = Graph;
