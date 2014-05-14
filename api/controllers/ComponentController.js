/**
 * ComponentController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  create: function(req, res, next){
    var userID = req.session.user.id;
    Component.create(req.params.all()).exec(function(err,created){
      if(err) return next(err);
      if(!created) return next();
      res.json({
        type: 200,
        message: 'component successfully created'
      });
    });
  },
  
  update: function(req, res){
    var socket = req.socket;
    var body = req.body;
    var id = body.id;
    delete body.id;
    delete body._csrf;
    Component.update(id,{
      data: body
    }, function(err, users) {
      // Error handling
      if (err) {
        return console.log(err);
      // Updated users successfully!
      } else {
        CollaborationService.emitMessageToGraph(socket.graphId,'action',{type:"updateComponent", id:id, data:body});
      }
    });
  }
};
