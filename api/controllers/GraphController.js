/**
 * GraphController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  create: function(req,res, next){
    var userID = req.user.id;
    Graph.create(req.params.all()).exec(function(err,created){
      if(err) return next(err);
      if(!created) return next();
      sails.log('Created project with name '+created.name);
    });
  },
  
  subscribe:function(req,res, next){
    var id = req.param('id');
    Graph.findOne(id).populate('components').populate('connections').exec(function (err, graph){
      if(err) return next(err);
      if(!graph) return next();
      CollaborationService.joinUserToGraph(req,res,graph);
    });
  },
  
  removeComponent: function(req,res, next){
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
  
  createAndConnectComponent: function(req,res, next){
    var body = req.body;
    GraphGeneratorService.createAndConnectComponent(
      req.socket.projectId, req.socket.graphId, body.command,
      body.componentId, body.startPort, body.position,
      function(err, result){
        if(err) return next(err)
        CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
          type:"addComponent",
          component: result.component,
          connection: result.connection
        });
        
        res.json({
          message: "component sucessfully added",
          component: result.component,
          connection: result.connection
        })
      })
  },

  createComponent: function(req,res, next){
    var body = req.body;
    GraphGeneratorService.createComponent(
      req.socket.projectId, req.socket.graphId, body.command, body.position,
       function(err, created) {  
        if(err) return next(err)
        CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
          type:"addComponent",
          component: created,
        });
        
        res.json({
          message: "component sucessfully added",
          component: result.component,
        })
      })
  },

  removePipe: function(req,res, next){
    var body = req.body;
    Connection.destroy(body.data.id).exec(function(err, deleted){
      if(err) return next(err);
      CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
        type:"removePipe",
        pipes: deleted,
      });
      res.json({
          message: "pipe sucessfully removed",
          pipes: deleted
        })
    });
  },

  compile:function(req,res, next){
    GraphGeneratorService.compileGraph(req.socket.graphId, function(err, result){
      if(err) return next(err);
      res.json({
        command: result,
      })
    })
  },


  compileProject:function(req,res, next){
    GraphGeneratorService.compileProject(req.socket.projectId, function(err, result){
      if(err) return next(err);
      res.json({
        command: result,
      })
    })
  },

  connect: function(req,res, next){
    var connectionData = req.body.data
    graphUtils.connect(req.socket.graphId, connectionData, function(err, created){
      if(err){
        res.json({
          alert: true,
          message:err,
        });
      } else {
        CollaborationService.emitMessageToGraph(req.socket.graphId, 'action', {
          type:"addComponent",
          connection: created,
        });
        res.json({
          alert: false,
          message: "connection sucessfully added",
          connection: created,
        });
      }
    })
  },

  runGraph:function(req,res, next){

    GraphGeneratorService.compileGraph(req.socket.graphId, function(err, command){
      if(err) return next(err);
      var projId = req.socket.projectId
      sails.log("to exectute: ", command)
      var child = ExecutionService.execute(command, projId)

      CollaborationService.emitMessageToProject(projId,'commandCall',command)

      child.stdout.on('data', function (data) {
        CollaborationService.emitMessageToProject(projId,'stdout',data.toString())
        //console.log('stdout -- ' + data.toString());

      });
      child.stderr.on('data', function (data) {
        CollaborationService.emitMessageToProject(projId,'stderr',data.toString())
        //console.log('stderr -- ' + data.toString());

      });
      child.on('close', function (code) {
        CollaborationService.emitMessageToProject(projId,'retcode',code)
        //console.log('child process exited with code ' + code);
      });
      res.json({
        command: command,
      })
    })
  },
  
  createfromcommand:function(req, res, next){
    sails.log("creating graph", req.param("command"))
    Graph.create(req.params.all()).exec(function(err,created){
      if(err || !created) return next(err);
      GraphGeneratorService.addToGraph(created.id, req.param("command"), function(err, result){
        if(err){return next(err)};
        res.json({
          message:"graph sucessfully created",
          graph: created
        });
      });
    });
  },
  
};
