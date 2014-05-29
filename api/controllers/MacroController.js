/**
 * MacroController
 *
 * @description :: Server-side logic for managing macroes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create:function(req,res,next){
    var data = req.body.data;
    var command = req.body.command;
    Graph.create(data).exec(function(err,created){
      if(err || !created) return next(err);
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
  },

  setData: function(req,res,next){
    var userID = req.user.id;
    var id = req.body.macroId;
    var data = req.body.data;
    Graph.findOne(id).exec(function(err,created){
      if(err || !created) return next(err);
      created.data = data;
      created.save(function(){
        res.json({
          message: "macro updated"
        })
      })
    });
  },
};

