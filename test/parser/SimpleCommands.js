var parser = require('../../target/parser/parser.js')
var Connection = parser.Connection
var Component  = parser.Component

function isComponent(component){ return component instanceof Component }

function isConnection(connection){ return connection instanceof Connection; }

function shouldBeAGraph(commandResult){
  commandResult.should.be.an.instanceof(parser.Graph)
  commandResult.components.should.matchEach(isComponent);
  commandResult.connections.should.matchEach(isConnection);
  return commandResult
}

function classname(classObject){
  return classObject.constructor.name;
}

describe('command test', function(){
  describe('Cat test', function(){
    it('should create a components with class CatComponent', function(){
    	var command = "cat -sA";
    	var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("CatComponent")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({
        "show tabs": true,
        "show ends": true,
        "show non-printing": true
      })
    })
  })

  describe('Grep test', function(){
    it('should create a components with class GrepComponent', function(){
      var command = "grep -F";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GrepComponent")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

    describe('Gzip test', function(){
    it('should create a components with class GrepComponent', function(){
      var command = "gzip";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GZipComponent")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Ls test', function(){
    it('should create a components with class GrepComponent', function(){
      var command = "ls";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("LsComponent")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })


    describe('Tail test', function(){
    it('should create a components with class GrepComponent', function(){
      var command = "tail -n10";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("TailComponent")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      //graph.components[0].selectors.should.have.properties({
      //  last: { type: 'numeric parameter', name: 'lines', value:10 }
      //})
    })
  })
})