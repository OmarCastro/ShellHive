/**
 * GraphController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  create: function(req,res){
    var userID = req.session.user.id;
    Graph.create(req.params.all()).exec(function(err,created){
      if(err) return next(err);
      if(!created) return next();
      sails.log('Created project with name '+created.name);
    });
  },
  
  subscribe:function(req,res){
    var id = req.param('id');
    Graph.findOne(id).populate('components').populate('connections').exec(function (err, graph){
      if(err) return next(err);
      if(!graph) return next();
      CollaborationService.joinUserToGraph(req,res,graph);
    });
  },
  
  removeComponent: function(req,res){
    GraphGeneratorService.removeComponent(req.body.id, function(err,result){
      if(err) return next(err);
      CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
        type:"removeComponent",
        components: result.components,
        connections: result.connections
      });
      res.json({
        message: "component sucessfully removed",
        components: result.components,
        connections: result.connections
      })
    });
  },
  
  createAndConnectComponent: function(req,res){
    var body = req.body;
    GraphGeneratorService.createAndConnectComponent(
      req.socket.projectId, req.socket.graphId, body.command, body.componentId, body.startPort, body.position,
      function(err, result){
        CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
          type:"addComponent",
          component: result.component,
          connection: result.connection
        });
        
        res.json({
          message: "component sucessfully removed",
          component: result.component,
          connection: result.connection
        })
      })
  },
  
  createfromcommand:function(req,res){
    var userID = req.session.user.id;
    Graph.create(req.params.all()).exec(function(err,created){
      if(err) return next(err);
      if(!created) return next();
      sails.log('Created project with name '+created.name);
    });
  },
  
};
