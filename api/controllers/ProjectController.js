/**
 * ProjectController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */


module.exports = {
  
  new:function(req, res){
    res.view({});
  },
  
  create: function(req,res){
    var userID = req.session.user.id;
    Project.create(req.params.all()).exec(function(err,created){
      if(err) return next(err);
      if(!created) return next();
      created.members.add(userID);
      created.save(function foundUser (err, user){
          if(err) res.json(err);
          else res.redirect("/project/show/"+created.id); 
        });
      sails.log('Created project with name '+created.name);
    });
  },
    
  show:function(req, res){
    Project.findOne(req.param('id')).populate('members').exec(function (err, project){
      if(err) return next(err);
      if(!project) return next();
      res.view({
        project:project,
        members:project.members
      });
    });
  },
  addmember:function(req, res){
    Project.findOne(req.param('id'), function foundProject (err, project){
      if(err) return next(err);
      if(!project) return next();
      User.findOne(req.param('memberId'), function foundUser (err, user){
        if(err) return next(err);
        if(!user) return next();
        project.members.add(user.id);
        project.save(function foundUser (err, user){
          if(err) res.json(err);
          else res.redirect("/project/show/"+project.id); 
        });
      });
    });
  },
    
  play:function(req, res){
    Project.findOne(req.param('id')).populate('members').populate('graphs').exec(function (err, project){
      if(err) return next(err);
      if(!project) return next();
      var members = project.members;
      if(members.indexOf(req.session.user.id)){
        res.view({
          project:project,
          members:project.members,
          layout: null
        });
      } else res.redirect("/project/show/"+project.id); 
      });
  },

  subscribe:function(req, res){
    var id = req.param('id');
    Project.findOne(id).populate('members').populate('graphs').exec(function (err, project){
      if(err) return next(err);
      if(!project) return next();
      var userId = req.session.user.id
      var members = project.members;
      var isMember = false;
      for(var i = 0, len = members.length; members[i].id != userId && i < len; ++i){}
      if(i < len){
        CollaborationService.joinUserToProject(req,res,project);
      } else {
        res.json({ error: 'User not found' }, 404);
      }
    });
  },

  graphaction: function(req,res){
    CollaborationService.broadcastMessageInProject(req,res)
  },
};
