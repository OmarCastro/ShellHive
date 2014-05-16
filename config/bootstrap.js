/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var fs = require('fs')

module.exports.bootstrap = function (cb) {
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  // cb();

var mkdir = function(dir) {
  // making directory without exception if exists
  try {
    fs.mkdirSync(dir, 0755);
  } catch(e) {
    if(e.code != "EEXIST") {
      throw e;
    }
  }
};

var copy = function(src, dest) {
  var oldFile = fs.createReadStream(src);
  var newFile = fs.createWriteStream(dest);
  util.pump(oldFile, newFile);
};

var copyDir = function(src, dest) {
  mkdir(dest);
  var files = fs.readdirSync(src);
  for(var i = 0; i < files.length; i++) {
    var current = fs.lstatSync(path.join(src, files[i]));
    if(current.isDirectory()) {
      copyDir(path.join(src, files[i]), path.join(dest, files[i]));
    } else if(current.isSymbolicLink()) {
      var symlink = fs.readlinkSync(path.join(src, files[i]));
      fs.symlinkSync(symlink, path.join(dest, files[i]));
    } else {
      copy(path.join(src, files[i]), path.join(dest, files[i]));
    }
  }
};

  // ********************************************
  // Create Dummy User Data
  // ********************************************
  function createDummyUserData(done) {
    var dummyUsers = [
    {
      name: "Administrador El Gran Sheriff",
      email:"admin@admin.pt",
      password: "admin123"
    },
    {
        name: "Omar Castro",
        email:"user@user.fe.up.pt",
        password: "teste123"  
    }
    ];
    User.count().exec(function(err, count) {
      if (err) return done(err);
      if (count > 0) return done();
      User.create(dummyUsers).exec(done);
    });
  }

  function createDummyProjects(done) {
    var dummyProjects = [
    {
      name:"El miel picante",
      members: [1,2]
    },
    ];

    Project.count().exec(function(err, count) {
      if (err) return done(err);
      if (count > 0) return done();

      rmdir = require('rimraf');
      rmdir('fs', function(error){
        var fs = require('fs.extra');
        fs.copyRecursive('fs-bootstrap', 'fs', function (error) {
        if(error) return done(err);
        });
          Project.create(dummyProjects).exec(function(err,res){
            var len = res.length;
            var current = 0;
            for (var i = len - 1; i >= 0; i--) {
              for(var j = 0, _ref=dummyProjects[i].members, length=_ref.length;j<length;++j){
                var value = _ref[j];
                res[i].members.add(value)
              }
            };
            if (len) {
              res.forEach(function(project){
                if(++current >= len){ done(err,res) }
              });
            } else {
              done(err,res)
            }
          });
        
      });
    });
  }

  function createDummyGraphs(done) {
    var dummyGraphs = [
      {
        name: null,
        project:1,
        isRoot:true
      },
      {
        name:"macroTest",
        project:1
      }
    ];

    var dummyCommands = ["cat json.txt | grep mimi", "ls | grep c"];

    Graph.count().exec(function(err, count) {
      if (err) return done(err);
      if (count > 0) return done();
      Graph.create(dummyGraphs).exec(function(err, res){
        if (err) return done(err);
        if (!res) return done();
        for (var i = Math.min(res.length, dummyCommands.length)  - 1; i >= 0; i--) {
          GraphGeneratorService.addToGraph(res[i].id,dummyCommands[i]);
        };
        done(err, res);
      });
    });
  }

  async.series([
    createDummyUserData,
    createDummyProjects,
    createDummyGraphs
  ],cb)

};// */