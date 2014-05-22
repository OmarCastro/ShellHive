/**
* CollaborationService.js
*
* @description :: Service that takes care of managing a graph.
* @docs        :: http://sailsjs.org/#!documentation/services
*/

var parser = require('../../lib/parser/parser.js');

function metaGraphfromCommand(command){
    var parsedGraph = parser.parseCommand(command);
    //parsedGraph.connections = parsedGraph.connections.map(function(connection){return connection.toJSON()});
    var componentMap = {}
    
    parsedGraph.components = parsedGraph.components.map(function(component){
      var obj = {}
      for(var key in component){
        switch(key){
        case 'id': break;   
        default: obj[key] = component[key];
        }           
      }
      componentMap[component.id] = obj
      return obj;
    });

    parsedGraph.connections = parsedGraph.connections.map(function(connection){return {
      startNode: componentMap[connection.startComponent.id],
      startPort: connection.startPort,
      endNode: componentMap[connection.endComponent.id],
      endPort: connection.endPort
    }});

    
    return parsedGraph.toJSON();
  }
    


/* istanbul ignore next */
function addInputAndOutputs(graph, newComponent){
  //async.parallel(
  //  componentsToCreate.map(function(component){
  //    return function(done){
  //      Component.create(component).exec(done);
  //    };
  //  });
  //Component.create(component).exec(done);
}


/* istanbul ignore next */
function createComponent(projectId, graphId, command, position, cb){
  var indexOfSpace = command.indexOf(" ");
  var firstWord = (indexOfSpace > -1 ) ? command.slice(0, command.indexOf(" ")) : command;
  var componentData;
  sails.log('command ', command, "1st word:", firstWord);
  if(firstWord.indexOf('.') >= 0){
    componentData = {
        graph: graphId,
        data: { type:"file", filename: firstWord }
      };
    
  } if(parser.isImplemented(firstWord)){
      var metagraph = metaGraphfromCommand(command);  
      componentData = {
        graph: graphId,
        data: metagraph.components[0]
      };

  } else {
    Graph.find({project:projectId}).exec(function(err, res){
      res
        .filter(function(graph){return !graph.isRoot})
        .every(function(graph){
          if(graph.name === command){
            componentData = {
              graph: graphId,
              data: { type:"macro", graph: graph.id }
            };
            return true
          } else return false
        })
    })
  }
  
  if(position){
    componentData.data.position = position;
  }
  Component.create(componentData).exec(cb);   
}

/* istanbul ignore next */
function createAndConnectComponent(projectId, graphId, command, componentId, startPort, position, cb){
  createComponent(projectId, graphId, command,position, function(err,created){
    if(err) return cb(err);
    var connectionData = {
      graph     : graphId,
      startNode : componentId,
      startPort : startPort,
      endNode   : created.id,
      endPort   : 'input'
    }
    sails.log('connectionData:', connectionData)
    Connection.create(connectionData).exec(function(err,createdConn){
      cb(err, {component: created, connection:createdConn})
    });
  });
}






module.exports = {
  
  metaGraphfromCommand:metaGraphfromCommand, 
  parser:parser, 
  addToGraph: function addToGraph(graphId, command, cb){
  cb = cb || function(){};
  var metagraph = GraphGeneratorService.metaGraphfromCommand(command);
  var components = metagraph.components;
  var componentsToCreate = components.map(function(component){
    return {
      graph: graphId,
      data: JSON.stringify(component)
    }
  })

  async.parallel(
    componentsToCreate.map(function(component){
      return function(done){
        Component.create(component).exec(done);
      };
    }), function(err, createdComponents){
      /* istanbul ignore if */ if(err || !createdComponents) return cb(err)
     metagraph.connections.forEach(function(connection){
      connection.graph = graphId
      connection.startNode = createdComponents[components.indexOf(connection.startNode)].id
      connection.endNode = createdComponents[components.indexOf(connection.endNode)].id
    });

    Connection.create(metagraph.connections).exec(function(err,createdConnections){
      /* istanbul ignore if */ if(err || !createdConnections) return cb(err)
      else return cb(null, {components: createdComponents, connections: createdConnections})
    });
  });
}, 
  createComponent: createComponent,
  createAndConnectComponent:createAndConnectComponent,

  removeComponent: /* istanbul ignore next */ function(id, callback){
    async.auto({
      components: function (cb) {Component.destroy({id:id}).exec(cb)},
      connections: function (cb) {Connection.destroy().where({or:[{startNode:id},{endNode:id}]}).exec(cb)}
    }, callback);
  },
  
  createGraphfromCommand: /* istanbul ignore next */ function(params, command){ 
  
  Graph.create(params).exec(function(err,created){
    //if(err) return next(err);
    //if(!created) return next();
      addToGraph(created.id, command)
      sails.log('Created project with name '+created.name);
    });
  },
  
  compileProject: function(id, cb){
    Graph.findOne({project: id, type:"root"}).populate('components').populate('connections').exec(function (err, graph){
      /* istanbul ignore if */ if(err) return cb(err, null);
      graph.components = graph.components.map(function(comp){comp.data.id = comp.id; return comp.data});      
      return cb(null, parser.parseGraph(parser.graphFromJsonObject(graph)));
    });
  },
      
  compileGraph: function(id, cb){
     Graph.findOne(id).populate('components').populate('connections').exec(function (err, graph){
      /* istanbul ignore if */ if(err) return cb(err, null);
      graph.components = graph.components.map(function(comp){comp.data.id = comp.id; return comp.data});      
      return cb(null, parser.parseGraph(parser.graphFromJsonObject(graph)));
    });
  }
};