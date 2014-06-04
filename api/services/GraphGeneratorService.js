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
function createComponent(projectId, graphId, command, position, cb){
  var indexOfSpace = command.indexOf(" ");
  var firstWord = (indexOfSpace > -1 ) ? command.slice(0, command.indexOf(" ")) : command;
  var componentData;
  var input = "input"
  //sails.log('command ', command, "1st word:", firstWord);
  if(firstWord.indexOf('.') >= 0){
    componentData = {
        graph: graphId,
        type:"file",
        data: { type:"file", filename: firstWord }
      };
    
  } else if(parser.isImplemented(firstWord)){
      var metagraph = metaGraphfromCommand(command);  
      componentData = {
        graph: graphId,
        type:"command",
        data: metagraph.components[0]
      };
  } else {
    Graph.find({project:projectId}).exec(function(err, res){
      res
        .filter(function(graph){return graph.type !== 'root'})
        .every(function(graph){
          if(graph.data.name === command){
            componentData = {
              graph: graphId,
              type:"macro",
              data: { type:"macro", graph: graph.id }
            };
            input = "macroIn0";
            return true
          } else return false
        })
    })
  }

  if(!componentData){
    return cb("unable to create component \""+firstWord+"\"");
  }
  
  if(position){
    componentData.data.position = position;
  }
  Component.create(componentData).exec(function(err,res){
    cb(err,res,input);
  });   
}

/* istanbul ignore next */
function createAndConnectComponent(projectId, graphId, command, componentId, startPort, position, cb){
  createComponent(projectId, graphId, command,position, function(err,created, endPort){
    if(err) return cb(err);
    var connectionData = {
      graph     : graphId,
      startNode : componentId,
      startPort : startPort,
      endNode   : created.id,
      endPort   : endPort
    }
    //sails.log('connectionData:', connectionData)
    Connection.create(connectionData).exec(function(err,createdConn){
      cb(err, {component: created, connection:createdConn})
    });
  });
}






module.exports = {
  
  metaGraphfromCommand:metaGraphfromCommand, 
  parser:parser, 

  
  addToGraph: function addToGraph(graphId, command, cb, addInOut){
  cb = cb || function(){};
  var metagraph = GraphGeneratorService.metaGraphfromCommand(command);
  var components = metagraph.components;
  var maxPos = 0
  var componentsToCreate = components.map(function(component){
    if(addInOut){
      component.position.x += 400;
      maxPos = Math.max(maxPos, component.position.x);
    }
    return {
      graph: graphId,
      data: JSON.stringify(component)
    }
  })

  if(addInOut){
    componentsToCreate = componentsToCreate.concat({
      graph: graphId,
      data: JSON.stringify({
        type:"input",
        position: {x:0, y:0},
        ports:["input"]
      })

    },{
      graph: graphId,
      data: JSON.stringify({
        type:"output",
        position: {x:maxPos + 400, y:0},
        ports:["output","error"]
      })
    })
  }

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
    Graph.find({project: id}).populate('components').populate('connections').exec(function (err, graphs){
      /* istanbul ignore if */ if(err) return cb(err, null);

      graphs.forEach(function(graph){
        graph.components = graph.components.map(function(comp){
          var data = comp.data;
          if(data.type == "macro"){
            var macro = _.find(graphs, function(graph){return graph.id == data.graph});
            data.macro = macro
            data.inputs = macro.data.inputs
            data.outputs = macro.data.outputs
          }
          if(data.type == "input"){
            data.ports = graph.data.inputs
          }
          if(data.type == "output"){
            data.ports = graph.data.outputs
          }
          data.id = comp.id; return data
        });
      });
      var rootGraph = _.find(graphs, function(graph){return graph.type == "root"});
      return cb(null, parser.parseVisualDataExperimental(parser.graphFromJsonObject(rootGraph)));
    });
  },
      
  compileGraph: function(id, cb){
     Graph.findOne(id).exec(function (err, graph){
      module.exports.compileProject(graph.project,cb)
    });
  }
};