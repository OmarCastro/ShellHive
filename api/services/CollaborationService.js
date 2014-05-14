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

  joinUserToProject: function joinUserToProject(req, res, project){
    
    var id = project.id;
    var projectRoom = project_room(id);
    
    var colors = ['#AE331F', '#D68434', '#116A9F', '#360B95', '#1c8826'];
    var socket = req.socket;
    var io = sails.io;
    var data = {}

    socket.userId = req.session.user.id;
    socket.projectId = project.id;
    socket.name = data.name = req.session.user.name;
    socket.color = data.color = colors[Math.floor(Math.random() * colors.length)];

    io.sockets.in(projectRoom).emit('mess',  {type: "new user", data: data});
    var existingClients = io.sockets.clients(projectRoom);
    var clientsData = existingClients.map(function(client){ return {name: client.name, color: client.color}});
    socket.join(projectRoom)
    sails.log('socket '+socket.id+' joined project room ' + id)
    //Project.subscribe( req.socket, project); //at the time of development it wasnt working well
    var response = {
      success: true,
      message: "you have been subscribed",
      clients: clientsData,
      implementedCommands: parser.implementedCommands,
      SelectionOptions: parser.VisualSelectorOptions,
      graphs: project.graphs
    }
    
    sails.log(response)
    
    res.json(response); 
  },
  
  joinUserToGraph: function joinUserToProject(req, res, graph){
    
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


      io.sockets.in(graphRoom).emit('mess',  {type: "new user in graph", data: data});
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
  

  broadcastMessageInProject:  function broadcastMessageInProject(req, res){
    // Get the value of a parameter
    var param = req.body;
    //Project.message(req.body.id, {type: "action", action: req.body.message});
    var socket = req.socket;
    var io = sails.io;
    sails.log('broadcasting message -- '+req.body.message.type);

    socket.broadcast.to(project_room(req.body.id)).emit('action',req.body.message);
    // Send a JSON response
    res.json("action sent");
  }
};