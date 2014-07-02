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
var md = require("marked"); 
var ejs = require('ejs') 

module.exports.bootstrap = function (cb) {

  ejs.filters.md = function(b) { 
    return md(b) 
  }; 
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
      async.series(dummyUsers.map(function(user){
        return function(cb){User.create(user).exec(cb)}
      }), done);
    });
  }

  function createDummyProjects(done) {
    var dummyProjects = [
    {
      name:"ShellHive Demo",
      visibility: "global"
    },
    {
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
        project:1,
        type:"root"
      },
      {
        project:2,
        type:"root"
      },
      {
        data:{
          inputs:["input"],
          outputs:["output", "error"],
          name:"macroTest",
          description:"a test macro"
        },
        type: "macro",
        project:2
      }
    ];

    var dummyCommands = ["cat events.txt |  tr -d [:punct:] | tr [:space:] '\\n' | sort | uniq -c > mapreduced.txt", "curl http://get.docker.io/ubuntu/ | grep \"#\"", "cat mini.txt"];

    Graph.count().exec(function(err, count) {
      if (err || count > 0) return done(err);
      Graph.create(dummyGraphs).exec(function(err, res){
        if (err) return done(err);
        if (!res) return done();
        var toMap = (res.length < dummyCommands.length)?res:dummyCommands
        var series = toMap.map(function(__, i){
          return function(cb){

            GraphGeneratorService.addToGraph(res[i].id,dummyCommands[i],cb,res[i].type == "macro");
          }
        });
        series.push(function(cb){
          GraphGeneratorService.createAndConnectComponent(2,2,"macroTest",5, "output", null,cb);
        })
        async.series(series,done);
      });
    });
  }

  async.series([
    createDummyUserData,
    createDummyProjects,
    createDummyGraphs
  ],cb)

};// */