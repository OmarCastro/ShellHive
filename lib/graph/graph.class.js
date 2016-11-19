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
    Graph.prototype.containsComponent = function (component) {
        for (var i = 0, _ref = this.components, length = _ref.length; i < length; ++i) {
            if (_ref[i] == component) {
                return true;
            }
        }
        return false;
    };
    /**
      removes the component of the graph and returns the connections related to it
    */
    Graph.prototype.removeComponent = function (component) {
        if (this.containsComponent(component)) {
            if (component == this.firstMainComponent) {
                this.firstMainComponent = null;
            }
            var returnlist = [];
            var filteredlist = [];
            for (var i = 0, _ref = this.connections, length = _ref.length; i < length; ++i) {
                var connection = _ref[i];
                if (connection.startComponent == component || connection.endComponent == component) {
                    returnlist.push(connection);
                }
                else {
                    filteredlist.push(connection);
                }
            }
            this.components.splice(this.components.indexOf(component), 1);
            this.connections = filteredlist;
            return returnlist;
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
