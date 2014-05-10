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
    

function addToGraph(graphId, command){
  var metagraph = metaGraphfromCommand(command);

  var metaComponents = metagraph.components.map(function(component){
    return {
      graph: graphId,
      data: component
    }
  })
    
  Component.create(metaComponents).exec(function(err,created){
    if(err) return next(err);
     var components = metagraph.components;
     metagraph.connections.forEach(function(connection){
      connection.graph = graphId
      connection.startNode = created[components.indexOf(connection.startNode)].id
      connection.endNode = created[components.indexOf(connection.endNode)].id
    });
    
    Connection.create(metagraph.connections).exec(function(err,created){
      if(err) return next(err);
    });
  });
}



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


function createAndConnectComponent(projectId, graphId, command, componentId, startPort, position, cb){
  createComponent(projectId, graphId, command,position, function(err,created){
    if(err) return next(err);
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
  addToGraph:addToGraph, 
  createAndConnectComponent:createAndConnectComponent,

  removeComponent: function(id, callback){
    async.auto({
      components: function (cb) {Component.destroy({id:id}).done(cb)},
      connections: function (cb) {Connection.destroy().where({or:[{startNode:id},{endNode:id}]}).done(cb)}
    }, callback);
  },
  
  createGraphfromCommand: function(params, command){ 
  
  Graph.create(params).exec(function(err,created){
    //if(err) return next(err);
    //if(!created) return next();
      addToGraph(created.id, command)
      sails.log('Created project with name '+created.name);
    });
  },
  
      
    compileGraph: function(id, cb){
       Graph.findOne(id).populate('components').populate('connections').exec(function (err, graph){
        if(err) return next(err);
        if(!graph) return next();
        
        graph.components = graph.components.map(function(comp){comp.data.id = comp.id; return comp.data});      
         
        cb(parser.parseGraph(parser.graphFromJsonObject(graph)));
      });
    }
};