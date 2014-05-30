/**
 * ProjectController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs');
/* istanbul ignore next */
function walk(dir, done) {
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

  setmyname:function(req, res){
    CollaborationService.setSocketName(req.socket,req.body);
    res.json("done");
  },
  
  create: function(req,res, next){
    var userID = req.user.id;
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
      if(err || !project) return next(err);
      res.view({
        project:project,
        members:project.members
      });
    });
  },


  chat:function(req, res){
    CollaborationService.chat(req,res);
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
    Project.findOne(req.param('id')).populate('members').exec(function (err, project){
      if(err || !project) return next(err);
      if(project.visibility == "global"){
        res.view({
          locals:{project:true},
          project:project,
          members:project.members,
          layout: null
        });
      } else if(req.user) {
        var members = project.members;
        if(members.indexOf(req.user.id)){
          res.view({
            locals : {project:true},
            project: project,
            members: project.members,
            layout: null
          });
        } else res.redirect("/project/show/"+project.id); 
      } else {
        res.redirect("/project/show/"+project.id); 
      }
      });
  },

  subscribe:function(req, res, next){
    var id = req.param('id');
    
    Project.findOne(id).populate('members').populate('graphs').exec(function (err, project){
      if(err || !project) return next(err);
      if(project.visibility == "global"){
        CollaborationService.joinUserToProject(req,res,project);
      } else if(!req.session.user){
        res.json({ error: 'not logged id' }, 500);
      } else {
        var userId = req.user.id
        if(_.some(project.members, function(member){return member.id == userId})){
          CollaborationService.joinUserToProject(req,res,project);
        } else {
          res.json({ error: 'User not found' }, 404);
        }
      }
    });


  },

  graphaction: function(req, res, next){
    CollaborationService.broadcastMessageInProject(req,res)
  },

  showDir: function(req, res, next){
    var fsPath = sails.config.shusee.fsPath
    var savedDirectory = fsPath+'/projects/';
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
    var fsPath = sails.config.shusee.fsPath
    var directoryToSave = fsPath+'/projects/' + req.params.id+ "/";

    req.file('file').upload({dirname: directoryToSave}, function onUploadComplete (err, uploadedFiles) {
      if (err) return res.serverError(err);

      return res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!',
        files: uploadedFiles
      });
    });
  },

  downloadfile:function(req, res, next){
    var fsPath = sails.config.shusee.fsPath
    var savedDirectory = fsPath + '/projects/';
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
    var fsPath = sails.config.shusee.fsPath
    var savedDirectory = fsPath+'/projects/';
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
