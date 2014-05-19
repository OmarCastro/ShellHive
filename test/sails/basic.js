var expect = chai.expect;
var should = chai.should();


/**
 * Bootstrap
 */
var Sails = require('sails');
var request = require('supertest');

/**
 * Before ALL the test bootstrap the server
 */
 
var app;
describe("Sails test", function(){ 
  before(function(done) {
    
    
    this.timeout(15000);
    
    // TODO: Create the database
    // Database.createDatabase.....

    Sails.lift({

      log: {
        level: 'info'
      },

      models:{
        connection: 'localMemoryDb'
      },

      shusee: {
        useDocker: false,
      },

      //globals: true,
      //hooks: {
      //  grunt: false
      //}

    }, function(err, sails) {
      app = sails;
      done(err, sails);
    });
    
  });
   
   
  describe('Routes', function(done) {
    it('GET / should return 200', function (done) {
      request(Sails.hooks.http.app).get('/').expect(200, done);
    });
      it('GET /user/1 should return 200', function (done) {
      request(Sails.hooks.http.app).get('/user/1').expect(200, done);
    });
  });

  describe('Sails Graph compile', function(done) {
    it('should compile a graph in a database', function (done) {
      global.GraphGeneratorService.compileGraph(1,function(err, result){
       expect(result).to.equal("cat  json.txt | grep  Gloss"); 
       done();
      });
    });

    it('should compile a project and should be the same as the root graph', function (done) {
      var service = global.GraphGeneratorService
      global.async.parallel([
        function(cb){service.compileGraph(1, cb)},
        function(cb){service.compileProject(1, cb)}
      ], function(err,results){
        expect(results[0]).to.equal(results[1])
        done();
      })
    });
  });


  describe('Sails Command Execution', function(done) {
    it('should execute a project', function (done) {
      child = global.ExecutionService.execute("ls",1)
      child.stdout.on("data", function(data){
        expect(data.toString()).to.equal("json.txt\n");
        done();
      })
    });
  });


  describe('Sails Graph Component Connection Validation', function(done) {
    this.timeout(7000);
    var graph;
    var id;
    var inputfile;
    var cat;
    var grep;


    before(function(done){
      async.series([
        function(cb){
          Component.create({graph: 1, data: {type: "file"} })
          .exec(function(err, created){
            if(err || !created) cb(err);
            id = created.id;
            cb();
          })
        }, function(cb){ 
          Graph.findOne(1)
          .populate('components')
          .populate('connections')
          .exec(function(err, res){
            if(err || !res) cb(err);
            graph = res;
            res.components.forEach(function(comp){
              if(comp.data.type == "file" && !inputfile){inputfile = comp.id}
              else if(comp.data.exec == "cat"){ cat = comp.id }
              else if(!grep){ grep = comp.id; }
            })
            sails.log(inputfile, cat, grep, id)
            cb();
          });
        }], 
      done);
    })

    it('should connect successfully', function (done) {
      var newConn = {
        startNode: grep,
        endNode: id,
        startPort: 'output',
        endPort: 'input' 
      }

      global.graphUtils.connect(1, newConn, function(err, res){
        res.should.have.properties({
          startNode: grep,
          endNode: id,
          startPort: 'output',
          endPort: 'input' 
        })
        Graph.findOne(1) // update the graph
          .populate('components')
          .populate('connections')
          .exec(function(err, res){
            if(err || !res) cb(err);
            graph = res;
            done();
          });
      })
    });

    it('should show "same node" error when validating connection', function (done) {
      var newConn = {
        startNode: cat,
        endNode: cat,
        startPort: 'output',
        endPort: 'input' 
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Trying to connect the same node");
        done();
      })
    });

    it('should show "input to input" error when validating connection', function (done) {
      var newConn = {
        startNode: cat,
        endNode: grep,
        startPort: 'input',
        endPort: 'input' ,
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Trying to connect an input with another input");
        done();
      })
    });

    it('should show "output to output" error when validating connection', function (done) {
      var newConn = {
        startNode: cat,
        endNode: grep,
        startPort: 'output',
        endPort: 'error' ,
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Trying to connect an output with another output");
        done();
      })
    });

    it('should show "writing read file" error when validating connection', function (done) {
      var newConn = {
        startNode: grep,
        endNode: inputfile,
        startPort: 'output',
        endPort: 'input' ,
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Trying to write a file used to read");
        done();
      })
    });

    it('should show "reading write file" error when validating connection', function (done) {
      var newConn = {
        startNode: id,
        endNode: cat,
        startPort: 'output',
        endPort: 'input' ,
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Trying to read a file used to write");
        done();
      })
    });

    it('should show "connection exists" error when validating connection', function (done) {
      var newConn = {
        startNode: grep,
        endNode: id,
        startPort: 'output',
        endPort: 'input' 
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Connection already exists");
        done();
      })
    });

    it('should show "cycle detected" error when validating connection', function (done) {
      var newConn = {
        startNode: grep,
        endNode: cat,
        startPort: 'output',
        endPort: 'input' 
      }

      global.graphUtils.ValidateConnection(graph, newConn, function(err, res){
        err.should.equal("Connection creates a cycle");
        done();
      })
    });
  });

      
  //describe('Sails Command Execution using Docker', function(done) {
  //  this.timeout(5000);
  //  it('should execute a project', function (done) {
  //    app.config.shusee.useDocker = true
  //    child = global.ExecutionService.execute("ls",1)
  //    child.stdout.on("data", function(data){
  //      expect(data.toString()).to.equal("json.txt\n");
  //      done();
  //    })
  //  });
  //});


  /**
   * After ALL the tests, lower sails
   */
   
  after(function(done) {
    // TODO: Clean up db
    // Database.clean...
    app.lower(done);
  });
});