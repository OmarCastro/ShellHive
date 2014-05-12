/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
/*
module.exports.bootstrap = function (cb) {
/*  User.count().exec(function(err, count) {
    if(err) {
      sails.log.error('Already have data.');
      return cb(err);
    }
    if(count > 0) return cb();

		User.create(dummyUsers).exec(cb);
  });*
  var dummyUsers = [{
    name: "Omar Castro",
    email:"ei08158@fe.up.pt",
    password: "ei08158"
  }, {
      name: "Omar Castillo",
      email:"omar.castro@fe.up.pt",
      password: "ei08158"  
  }]
  User.create(dummyUsers).exec(function(err,res){
    sails.log(err,res);
    Project.create({name:"mimi", members:res}).exec(function(err,res){
     res.members.add(1)
     res.members.add(2)
     res.save(sails.log);
    })
    Graph.create([{name: "mimi", project:1, isRoot:true},{name:"momo", project:1}]).exec(sails.log)
      //User.findOne(1).populate('projects').exec(function(err,res){sails.log(res.toJSON())})

    Project.findOne(1).populate('members').populate('graphs').exec(function(err,res){sails.log(res.toJSON())})
    GraphGeneratorService.addToGraph(1,"cat json.txt | grep mimi");
    GraphGeneratorService.addToGraph(2,"ls | grep c");
    //Graph
    //.findOne(1)
    //.populate("components")
    //.populate("connections")
    //.exec(function(err,res){sails.log(res.toJSON())})
    GraphGeneratorService.compileGraph(1,sails.log);

  })
 
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};// */


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
      name: "Super Administrator",
      email:"admin@admin.pt",
      password: "admin123"
    },
    {
        name: "Omar Castro",
        email:"ei08158@fe.up.pt",
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
      name:"my first project",
      members: [1,2]
    },
    ];
    Project.count().exec(function(err, count) {
      if (err) return done(err);
      if (count > 0) return done();
      Project.create(dummyProjects).exec(function(err,res){
        var saves = []
        for (var i = dummyProjects.length - 1; i >= 0; i--) {
          for(var j = 0, _ref=dummyProjects[i].members, length=_ref.length;j<length;++j){
            var value = _ref[j];
            res[i].members.add(value)
          }
          saves.push(res[i].save)
        };
        res[0].save(done)
        // TODO: fix for multiple projects
        //if (saves.length) {
        //  sails.log(saves);
        //  async.parallel(saves, done)
        //} else {
        //  done(err,res)
        //}
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