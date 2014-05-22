/**
 * UsersController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
module.exports = {
  new: function (req, res) {
      res.view();
  },

  create: function(req,res, next){
    User.create(req.params.all()).exec(function(err,created){
      if(err || !created) return next(err);
      else res.redirect("/user/show/"+created.id); 
    });
  },

  show:function(req, res, next){
    User.findOne(req.param('id'), function(err, user){
      if(err || !user) return next(err);
      User.findOne(req.param('id')).populate("projects").exec(function (err, result){
        res.view({
          user:user,
          projects:result.projects
        });
      });
    });
  },
    
  //index:function(req, res){
  //  User.find(function foundUsers (err, users){
  //    if(err) return next(err);
  //    res.view({users:users});
  //  });
  //},
};
