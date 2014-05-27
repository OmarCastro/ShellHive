/**
 * UsersController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

  var util = require('util')

module.exports = {
  new: function (req, res) {
      res.view();
  },

  signup: function(req,res, next){
    if(req.param("confirmation") !== req.param("password")){
      req.session.flash = {
        err: ["confirmation password is different"]
      }
      return res.redirect("/"); 
    }
    User.create(req.params.all()).exec(function(err,created){
      sails.log(req.session);
      if(err || !created){
        var errMsg; 
        if(err.ValidationError){
          errMsg = showValidationError(User,err.ValidationError);
          var errlist = []
          _.each(_.values(errMsg),function(errlst){
            errlist.push(_.values(errlst[0])[0]);
          })
          errMsg = errlist;
        } else {
          errMsg = err.details;
          /* istanbul ignore else : should not happen */
          if(errMsg.indexOf("Uniqueness check failed on attribute: email") > -1){
            errMsg = ["email already exists"]
          } else {
            errMsg = [errMsg];
          }
        }

        req.session.flash = {
          err: errMsg
        }
        return res.redirect("/");
      } else {
        passport.authenticate('local', function(err, user, info){
            if (err || !user) return res.redirect('/')
            req.login(user, function(err){
              /* istanbul ignore next : should not happen */
              if (err) res.redirect('/');
              req.session.user = user;
              res.redirect("/user/show/"+user.id);
            });
          })(req, res);
        req.session.flash = {};
      }
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
