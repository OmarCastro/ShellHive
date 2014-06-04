var tsort = require('tsort');


module.exports = {
  tsortGraph: function tsortGraph(graph, newConnection, cb){
    /* istanbul ignore next: just a function check */
    if(typeof newConnection == "function"){
      cb = newConnection
      newConnection = null;
    }
    var tgraph = tsort();
    graph.connections.forEach(function(c){
      tgraph.add(c.startNode, c.endNode)
    });
    if(newConnection){
      tgraph.add(newConnection.startNode, newConnection.endNode)
    }
    try{
      var result = tgraph.sort()
      return cb(null, result)
    } catch(err){
      return cb(err)
    }
  },

  ValidateConnection: function(graph, newConnection, callback){
    function portType(c,p){
      if(c.data.type == "input") return true;
      else if(c.data.type == "output") return false;
      else return (p == "output" || p == "error" || p == "retcode");
    }

    function portTypeName(c,p){return portType(c,p) ? "output" : "input"}

    async.series([
      function(cb){
        var sNode = newConnection.startNode 
        var sPort = newConnection.startPort 
        var eNode = newConnection.endNode 
        var ePort = newConnection.endPort
        var sComponent = _.find(graph.components, function(comp){return comp.id == sNode})
        var eComponent = _.find(graph.components, function(comp){return comp.id == eNode})

        if(sNode == eNode){return cb({message:"Trying to connect the same node"})}
        else if(portType(sComponent,sPort) == portType(eComponent,ePort)){
          var portName = portTypeName(sComponent,sPort)
          return cb({message:"Trying to connect an "+ portName +" with another " + portName})
        }
        if(sComponent.data.type == "file" &&
           _.some(graph.connections, function(conn){return conn.endNode == sComponent.id})){
         return cb({message: "Trying to read a file used to write"})
        }

        if(eComponent.data.type == "file" &&
           _.some(graph.connections, function(conn){return conn.startNode == eComponent.id})){
         return cb({message: "Trying to write a file used to read"})
        }

        if(_.some(graph.connections, function(conn){
          return conn.startNode == sNode && conn.endNode == eNode
              && conn.startPort == sPort && conn.endPort == ePort
        })){
         return cb({message: "Connection already exists"});
        }


        return cb(null, true);
      }, function(cb){graphUtils.tsortGraph(graph, newConnection,cb)}
    ], function(err, res){
      if(err){
        var msg = err.message;
        if(_.contains(msg, 'There is a cycle in the graph')){
          msg = "Connection creates a cycle"
        }
        return callback(msg);
      }
      return callback(err, res);
    })
  },

  connect: function(graph, newConnection, cb){
    Graph.findOne(graph)
    .populate('components')
    .populate('connections')
    .exec(function(err,result){
      /* istanbul ignore next */ if(err || !result) return cb(err);
      graphUtils.ValidateConnection(result, newConnection, function(err, res){
        /* istanbul ignore next */  if(err || !res) return cb(err);
        newConnection.graph = graph;
        Connection.create(newConnection).exec(cb);
      })
    });
  }
}