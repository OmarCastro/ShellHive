"use strict";
/**
    Represents a connection between 2 components
*/
var Connection = (function () {
    function Connection(startComponent, startPort, endComponent, endPort) {
        this.startComponent = startComponent;
        this.startPort = startPort;
        this.endComponent = endComponent;
        this.endPort = endPort;
    }
    Object.defineProperty(Connection.prototype, "startNode", {
        get: function () { return this.startComponent.id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "endNode", {
        get: function () { return this.endComponent.id; },
        enumerable: true,
        configurable: true
    });
    Connection.prototype.toJSON = function () {
        return {
            startNode: this.startNode,
            startPort: this.startPort,
            endNode: this.endComponent.id,
            endPort: this.endPort
        };
    };
    return Connection;
}());
exports.Connection = Connection;
