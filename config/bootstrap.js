/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var fs = require('fs.extra');
var rmdir = require('rimraf');


module.exports.bootstrap = function (cb) {
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  // cb();

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
      if (err || count > 0) return done(err);
      User.create(dummyUsers).exec(done);
    });
  }

  function createDummyProjects(done) {
    var dummyProjects = [{
      name:"project miel picante",
      members: [1,2]
    }];

    Project.count().exec(function(err, count) {
      if (err || count > 0) return done(err);
      function removeCurrentFileSystem(callback){ rmdir('fs', callback) }
      function copyBootstrap(callback){ fs.copyRecursive('fs-bootstrap', 'fs', callback) }
      function createProjects(callback){ Project.create(dummyProjects).exec(callback) }

      async.series([
        removeCurrentFileSystem,
        copyBootstrap,
        createProjects
      ],done)
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

    var dummyCommands = ["cat json.txt | grep Gloss", "ls | grep c"];

    Graph.count().exec(function(err, count) {
      if (err || count > 0) return done(err);
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