
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(require('chai-properties'));

var expect = chai.expect;
var should = chai.should();

require('./parser/common')
require('./parser/parser')
require('./parser/AST')
require('./parser/Graph')
require('./parser/SimpleCommands')


/**
 * Bootstrap
 */

var Sails = require('sails');
    //Database = require('./database'),
    //localConf = require('../../config/local');
var request = require('supertest');

/**
 * Before ALL the test bootstrap the server
 */
 
var app;

var Graph,GraphGeneratorService;

 
before(function(done) {
  
  
  this.timeout(10000);
  
  // TODO: Create the database
  // Database.createDatabase.....

  Sails.lift({

    log: {
      level: 'error'
    },

    adapters: {
      memory: {
        module: 'sails-memory',
      }
    }

  }, function(err, sails) {
    app = sails;
    Graph = sails.models.graph;
    GraphGeneratorService = sails.services.graphgeneratorservice;
    done(err, sails);
  });
  
});
 
 
//describe('User', function(done) {
//  it("should be able to create", function(done) {
//    User.create({name: "hee", email: "a@b.c"}, function(err, user) {
//      should.notExist(user);
//      done();
//    });
//  });
//});
//


describe('Routes', function(done) {
  it('GET / should return 200', function (done) {
    request(Sails.hooks.http.app).get('/').expect(200, done);
  });
});

describe('Sails Graph compile', function(done) {
  it('should compile a graph in a database', function (done) {
  //Graph.create([{name: "test1", project:1, isRoot:true},{name:"test2", project:1}]).exec(sails.log)
  //GraphGeneratorService.addToGraph(3,"cat json.txt | grep mimi");
    GraphGeneratorService.compileGraph(1,function(err, result){
     expect(result).to.equal("cat  json.txt | grep  mimi"); 
     done();
    });
  });
});


    


/**
 * After ALL the tests, lower sails
 */
 
after(function(done) {
 
  // TODO: Clean up db
  // Database.clean...
  
  app.lower(done);
 
});