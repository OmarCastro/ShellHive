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
    it('should cexecute a project', function (done) {
      child = global.ExecutionService.execute("ls",1)
      child.stdout.on("data", function(data){
        expect(data.toString()).to.equal("json.txt\n");
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