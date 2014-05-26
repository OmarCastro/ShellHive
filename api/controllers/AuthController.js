/**
 * AuthController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var passport = require("passport");
module.exports = {
  login: function(req,res){
    passport.authenticate('local', function(err, user, info){
      if (err || !user) return res.redirect('/')
      req.login(user, function(err){
        /* istanbul ignore next : should not happen anyway */
        if (err) res.redirect('/');
        req.session.user = user;
        res.redirect("/user/show/"+user.id);
      });
    })(req, res);
  },

  logout: function(req, res){
     req.logout();
     req.session.user = null;
     res.redirect("/");
  },
};
