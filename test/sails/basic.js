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
var server;
var _csrf;

describe("Sails test", function(){ 
  before(function(done) {
    
    
    this.timeout(15000);
    
    // TODO: Create the database
    // Database.createDatabase.....

    Sails.lift({

      log: {
        level: 'warn'
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

    }, function(error, sails) {
      app = sails;
      server = request.agent(Sails.hooks.http.app);
      server
        .get('/csrfToken')
        .expect(200)
        .end(function(err, res){
          _csrf = res.body._csrf;
          if (err) return done(err);
          done(error, sails);
        });
    });


    
  });
   
   
  describe('Routes', function(done) {
    it('GET / should return 200', function (done) {
      server.get('/').expect(200, done);
    });
    it('GET /user/1 should return 200', function (done) {
      server.get('/user/1').expect(200, done);
    });
    it('GET /project/play/1 should return 200', function (done) {
      server.get('/project/play/1').expect(200, done);
    });

    it('GET /project/play/2 should return 302', function (done) {
      server.get('/project/play/2').expect(302, done);
    });

    it('GET /user/new should return 200', function (done) {
      server.get('/user/new').expect(200, done);
    });

    it('GET /project/new should return 200', function (done) {
      server.get('/project/new').expect(200, done);
    });

     it('Login fails - wrong username', function (done) {
      server
        .post('/auth/login')
        .send({email:"admin@n.pt", password:"admin123", _csrf:_csrf})
        .type('form')
        .expect(302)
        .expect('Location', '/')
        .end(done);
    });

    it('Login fails  - wrong password', function (done) {
      server
        .post('/auth/login')
        .send({email:"admin@admin.pt", password:"admin13", _csrf:_csrf})
        .type('form')
        .expect(302)
        .expect('Location', '/')
        .end(done);
    });

    it('Login alright', function (done) {
      server
        .post('/auth/login')
        .send({email:"admin@admin.pt", password:"admin123", _csrf:_csrf})
        .type('form')
        .expect(302)
        .expect('Location', '/user/show/1')
        .end(done);
    });

   it('GET /user/show/1 should return 200', function (done) {
      server.get('/user/show/1').expect(200, done);
    });

    it('GET /project/play/2 should return 200', function (done) {
      server.get('/project/play/2').expect(200, done);
    });

    it('GET /directories/project/2 should return 200', function (done) {
      server.get('/directories/project/2').expect(200, done);
    });

    it('GET /project/show/2 should return 200', function (done) {
      server.get('/project/show/2').expect(200, done);
    });

    it('GET /project/show/404 should return 404', function (done) {
      server.get('/project/show/404').expect(404, done);
    });

    it('GET /project/play/404 should return 404', function (done) {
      server.get('/project/play/404').expect(404, done);
    });


    it('GET /user/show/500 should return 404', function (done) {
      server.get('/user/show/500').expect(404, done);
    });

    it('Logout alright', function (done) {
      server
        .get('/logout')
        .expect(302)
        .end(done);
    });

    it('signup alright', function (done) {
      server
        .post('/signup')
        .send({
          name:"Omar Grande Xerife",
          email:"teste@admin.pt", 
          password:"teste123",
          confirmation:"teste123",
          _csrf:_csrf
        })
        .type('form')
        .expect(302)
        .expect('Location', '/user/show/3')
        .end(done);
    });

    it('Logout alright', function (done) {
      server
        .get('/logout')
        .expect(302)
        .end(done);
    });

  });

  describe('Sails Graph compile', function(done) {
    it('should compile a graph in a database', function (done) {
      global.GraphGeneratorService.compileGraph(1,function(err, result){
       expect(result).to.equal("cat json.txt | grep Gloss"); 
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
    var graph, id, inputfile, cat, grep

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

  require("../e2e/test")


  /**
   * After ALL the tests, lower sails
   */
   
  after(function(done) {
    // TODO: Clean up db
    // Database.clean...
    app.lower(done);
  });
});