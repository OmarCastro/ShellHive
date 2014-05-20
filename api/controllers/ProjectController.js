/**
 * ProjectController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};


module.exports = {
  
  new:function(req, res){
    res.view({});
  },
  
  create: function(req,res, next){
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
    
  show:function(req, res, next){
    Project.findOne(req.param('id')).populate('members').exec(function (err, project){
      if(err) return next(err);
      if(!project) return next();
      res.view({
        project:project,
        members:project.members
      });
    });
  },
  addmember:function(req, res, next){
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
    
  play:function(req, res, next){
    Project.findOne(req.param('id')).populate('members').populate('graphs').exec(function (err, project){
      if(err) return next(err);
      if(!project) return next();
      var members = project.members;
      if(members.indexOf(req.session.user.id)){
        res.view({
          locals:{project:true},
          project:project,
          members:project.members,
          layout: null
        });
      } else res.redirect("/project/show/"+project.id); 
      });
  },

  subscribe:function(req, res, next){
    var id = req.param('id');
    if(!req.session.user){
      res.json({ error: 'not logged id' }, 500);
    } else {
      Project.findOne(id).populate('members').populate('graphs').exec(function (err, project){
        if(err) return next(err);
        if(!project) return next();
        var userId = req.session.user.id
        var members = project.members;
        var isMember = false;
        if(id == 1){ //special public project

        }
        for(var i = 0, len = members.length; members[i].id != userId && i < len; ++i){}
        if(i < len){
          CollaborationService.joinUserToProject(req,res,project);
        } else {
          res.json({ error: 'User not found' }, 404);
        }
      });
    }


  },

  graphaction: function(req, res, next){
    CollaborationService.broadcastMessageInProject(req,res)
  },

  showDir: function(req, res, next){
    var savedDirectory = 'fs/projects/';
    var directoryToFind = savedDirectory + req.params.id;
    walk(directoryToFind, function(err, results){
      var result = results.map(function(result){
        return {
          name:result.slice(directoryToFind.length + 1),
          filename:result.replace(/^.*[\\\/]/, ''),
        }
      })
      res.json(result);
    })
  },

  uploadfile: function(req, res){
    var directoryToSave = './fs/projects/' + req.params.id+ "/";

    req.file('file').upload({dirname: directoryToSave}, function onUploadComplete (err, uploadedFiles) {
      if (err) return res.serverError(err);

      return res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!',
        files: uploadedFiles
      });
    });
  },

  downloadfile:function(req, res, next){
    var savedDirectory = 'fs/projects/';
    var directoryToFind = savedDirectory + req.params.id;
    var path = directoryToFind+'/'+req.params.path
    fs.exists(path, function(exists) {
      if (exists) {
        var filename = path.replace(/^.*[\\\/]/, '')
        res.download(path,filename);
      } else {
        res.notFound();
      }
    });
  },

  viewfile:function(req, res, next){
    var savedDirectory = 'fs/projects/';
    var directoryToFind = savedDirectory + req.params.id;
    var path = directoryToFind+'/'+req.params.path
    fs.exists(path, function(exists) {
      if (exists) {
        res.sendfile(path);
      } else {
        res.notFound();
      }
    });
  }


};
