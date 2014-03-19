/**
ComponentConnections

this class saves the connections to the component
while its ID is not yet identified

*/
(function(){
  var ComponentConnections;
  module.exports = ComponentConnections = (function(){
    ComponentConnections.displayName = 'ComponentConnections';
    var prototype = ComponentConnections.prototype, constructor = ComponentConnections;
    function ComponentConnections(component){
      this.component = component;
      this.connectionsToInput = [];
      this.connectionsFromOutput = [];
    }
    prototype.addConnectionToInputPort = function(port, otherNode){
      this.connectionsToInput.push({
        startNode: otherNode.id,
        startPort: otherNode.port,
        endPort: port
      });
    };
    prototype.addConnectionFromPort = function(port, otherNode){
      this.connectionsFromOutput.push({
        startPort: port,
        endNode: otherNode.id,
        endPort: otherNode.port
      });
    };
    prototype.addConnectionFromOutputPort = function(otherNode){
      this.addConnectionFromPort('output', otherNode);
    };
    prototype.addConnectionFromErrorPort = function(otherNode){
      this.addConnectionFromPort('error', otherNode);
    };
    prototype.addConnectionFromReturnCodePort = function(otherNode){
      this.addConnectionFromPort('retcode', otherNode);
    };
    prototype.toConnectionList = function(){
      var id, connections, res$, i$, ref$, len$, x;
      id = this.component.id;
      res$ = [];
      for (i$ = 0, len$ = (ref$ = this.connectionsFromOutput).length; i$ < len$; ++i$) {
        x = ref$[i$];
        res$.push((x.startNode = id, x));
      }
      connections = res$;
      connections = connections.concat((function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = this.connectionsToInput).length; i$ < len$; ++i$) {
          x = ref$[i$];
          results$.push((x.endNode = id, x));
        }
        return results$;
      }.call(this)));
      return connections;
    };
    return ComponentConnections;
  }());
}).call(this);
