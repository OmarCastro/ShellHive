/**
 * MacroController
 *
 * @description :: Server-side logic for managing macroes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create:function(req,res,next){
    var data = req.body.data;
    data.project = req.socket.projectId
    var command = req.body.command;
    Graph.find({project: data.project, type:'macro'}).exec(function(err,graphs){
      if(err || !graphs) return next(err);
      var exsistingGraph = _.find(graphs, function(graph){return graph.data.name == data.data.name})
      if(exsistingGraph){
        res.json({
            alert:true,
            message:"macro with same name already exists",
          }) 
      } else {
        Graph.create(data).exec(function(err,created){
          if(err || !created) return next(err);
          CollaborationService.updateMacroList(req.socket);
          if(command){
            GraphGeneratorService.addToGraph(created.id, command, function(){
              res.json({
                message:"macro created",
                name:created.data.name,
                macro: created.id
              })
            })
          }
          sails.log('Created macro with name '+created.name);
        });        
      }
    })

  },

  setData: function(req,res,next){
    var userID = req.user.id;
    var id = req.body.macroId;
    var data = req.body.data;
    Graph.findOne(id).exec(function(err,created){
      if(err || !created) return next(err);
      created.data = data;
      created.save(function(){
        CollaborationService.updateMacroList(req.socket);
        res.json({
          message: "macro updated"
        })
      })
    });
  },
};

