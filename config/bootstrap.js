/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {
/*  User.count().exec(function(err, count) {
    if(err) {
      sails.log.error('Already have data.');
      return cb(err);
    }
    if(count > 0) return cb();

		User.create(dummyUsers).exec(cb);
  });*/
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
};