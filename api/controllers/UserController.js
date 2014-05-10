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


  login: function (req, res) {
      var bcrypt = require('bcrypt');

      User.findOneByEmail(req.body.email).done(function (err, user) {
        if (err) res.json({ error: 'DB error' }, 500);

        if (user) {
          bcrypt.compare(req.body.password, user.password, function (err, match) {
            if (err) res.json({ error: 'Server error' }, 500);

            if (match) {
              req.session.authenticated = true;
              // password match
              req.session.user = {
                name:user.name,
                id:user.id
              }
              res.redirect("/user/show/"+user.id);
              //res.json(user);
            } else {
              // invalid password
              if (req.session.user) req.session.user = null;
              res.redirect("/");
              //res.json({ error: 'Invalid password' }, 400);
            }
          });
        } else {
          res.json({ error: 'User not found' }, 404);
        }
      });
    },
  logout: function(req, res){
     req.session.authenticated = false;
     req.session.user = null;
     res.redirect("/");
  },
  show:function(req, res){
    User.findOne(req.param('id'), function(err, user){
      if(err) return next(err);
      if(!user) return next();
      User.findOne(req.param('id')).populate("projects").exec(function (err, result){
        res.view({
          user:user,
          projects:result.projects
        });
      });
    });
  },
    
  index:function(req, res){
    User.find(function foundUsers (err, users){
      if(err) return next(err);
      res.view({users:users});
    });
  },
};
