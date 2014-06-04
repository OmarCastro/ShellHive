function project_room(id){return 'project_room_'+id}
function graph_room(graphId, projectID){return 'graph_'+graphId}
var parser = require('../../lib/parser/parser.js');

/**
* CollaborationService.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/services
*/
var CollaborationService = module.exports = {

  project_room: project_room,
  graph_room: graph_room,
  parser: parser,

  userleave: function(socket){
    if(socket.projectId){
      var projectRoom = project_room(socket.projectId);
      sails.io.sockets.in(projectRoom).emit('user leave', socket.id);
      socket.leave(projectRoom);
    }
  },

  updateMacroList: function(socket){
    if(socket.projectId){
      Graph.find({project: socket.projectId, type:'macro'}).exec(function(err, graphs){
        if(!err){
          var projectRoom = project_room(socket.projectId);
          sails.io.sockets.in(projectRoom).emit('updateMacroList', graphs);
        }
      });
    }
  },

  setSocketName: function(socket, data){
    if(socket.projectId){
      var collabData = socket.collabData;
      collabData.name = data.name;
      collabData.color = data.color || collabData.color;
      var projectRoom = project_room(socket.projectId);
      sails.io.sockets.in(projectRoom).emit('update user', collabData);
    }
  },

  joinUserToProject: function(req, res, project){
    
    var id = project.id;
    var projectRoom = project_room(id);
    
    var colors = ['#AE331F', '#D68434', '#116A9F', '#360B95', '#1c8826'];
    var socket = req.socket;
    var io = sails.io;
    var data = socket.collabData = {}
    if(req.user){
      socket.userId = req.user.id;
      data.name = req.user.name;
      data.visitor = false
    } else {
      socket.userId = -1;
      data.name = "Anonymous" 
      data.visitor = true;     
    }
    data.id = socket.id;
    data.color = colors[Math.floor(Math.random() * colors.length)];
    socket.projectId = project.id;

    io.sockets.in(projectRoom).emit('new user', data);
    socket.join(projectRoom)
    var existingClients = io.sockets.clients(projectRoom);
    var clientsData = existingClients.map(function(client){
      return client.collabData;
    });
    sails.log('socket '+socket.id+' joined project room ' + id)
    //Project.subscribe( req.socket, project); //at the time of development it wasnt working well
    var response = {
      success: true,
      message: "you have been subscribed",
      clients: clientsData,
      visitor: data.visitor,
      you: data,
      implementedCommands: parser.implementedCommands.filter(function(f){return f!="tee"}),
      SelectionOptions: parser.VisualSelectorOptions,
      graphs: project.graphs
    }
        
    res.json(response); 
  },
  
  joinUserToGraph: function(req, res, graph){
    
    if(req.socket && req.socket.projectId == graph.project){
      var id = graph.id;
      var graphRoom = graph_room(id);
      var socket = req.socket;
      var io = sails.io;
      var data = {}
      if(socket.graphId){
       socket.leave(graph_room(socket.graphId));
      }
      
      socket.graphId = id;


      //io.sockets.in(graphRoom).emit('mess',  {type: "new user in graph", data: data});
      socket.join(graphRoom)
      sails.log('socket '+socket.id+' joined grapj room ' + id)
      res.json({
        success: true,
        message: "you have been subscribed",
        graph: graph
      }); 
    } else {
       res.json("user hasn't join the project yet", 500); 
    }
  },
  emitMessageToGraph: function(id, type ,content){
    sails.io.sockets.in(graph_room(id)).emit(type,  content);
  },

  emitMessageToProject: function(id, type ,content){
    sails.io.sockets.in(project_room(id)).emit(type,  content);
  },

  chat: function(req,res){
    var socket = req.socket;
    var data = req.body.data;
    data.sender = socket.collabData.name;
    data.color = socket.collabData.color;
    sails.log("chat to project "+socket.projectId + " -- " + JSON.stringify(data));
    sails.io.sockets.in(project_room(socket.projectId)).emit('chat',data);
    res.json("message sent");
  },


  
  broadcastMessageInProject: function(req, res){
    // Get the value of a parameter
    var param = req.body;
    //Project.message(req.body.id, {type: "action", action: req.body.message});
    var socket = req.socket;
    var io = sails.io;
    sails.log('broadcasting message -- '+req.body.message.type);

    socket.broadcast.to(project_room(req.body.id)).emit('action',req.body.message);
    // Send a JSON response
    res.json("action sent");
  },

  broadcastMessageInGraph: function(req, res){
    // Get the value of a parameter
    var param = req.body;
    //Project.message(req.body.id, {type: "action", action: req.body.message});
    var socket = req.socket;
    var io = sails.io;
    sails.log('broadcasting message -- '+req.body.message.type);

    socket.broadcast.to(graph_room(req.socket.graphId)).emit('action',req.body.message);
    // Send a JSON response
    res.json("action sent");
  }
};