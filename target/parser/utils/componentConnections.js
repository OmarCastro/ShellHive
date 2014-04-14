var ComponentConnections = (function () {
    function ComponentConnections(component) {
        this.component = component;
        this.connectionsToInput = [];
        this.connectionsFromOutput = [];
    }
    ComponentConnections.prototype.addConnectionToInputPort = function (port, otherNode) {
        this.connectionsToInput.push({
            startNode: otherNode.id,
            startPort: otherNode.port,
            endPort: port
        });
    };

    ComponentConnections.prototype.addConnectionFromPort = function (port, otherNode) {
        this.connectionsToInput.push({
            startPort: port,
            endNode: otherNode.id,
            endPort: otherNode.port
        });
    };

    ComponentConnections.prototype.addConnectionFromOutputPort = function (otherNode) {
        this.addConnectionFromPort("output", otherNode);
    };

    ComponentConnections.prototype.addConnectionFromErrorPort = function (otherNode) {
        this.addConnectionFromPort("error", otherNode);
    };

    ComponentConnections.prototype.addConnectionFromReturnCodePort = function (otherNode) {
        this.addConnectionFromPort("retcode", otherNode);
    };

    ComponentConnections.prototype.toConnectionList = function () {
        var id = this.component.id;
        return this.connectionsFromOutput.map(function (connection) {
            connection.startNode = id;
            return connection;
        }).concat(this.connectionsToInput.map(function (connection) {
            connection.endNode = id;
            return connection;
        }));
    };
    return ComponentConnections;
})();

module.exports = ComponentConnections;
//# sourceMappingURL=componentConnections.js.map
