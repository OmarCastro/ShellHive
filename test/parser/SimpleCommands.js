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

  describe('Awk test', function(){
    it('should create a components with class CatComponent', function(){
      var command = 'awk "mimi"';
      var graph = parser.parseCommand(command)
      classname(graph.components[0]).should.equal("AwkComponent")
      graph.components[0].exec.should.equal("awk")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].should.have.properties({
        "script": "mimi"
      })
    })
  })

  describe('Cat test', function(){
    it('should create a components with class CatComponent', function(){
    	var command = "cat -sA";
    	var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("CatComponent")
      graph.components[0].exec.should.equal("cat")

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
      graph.components[0].exec.should.equal("grep")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Gzip test', function(){
    it('should create a components with class GzipComponent', function(){
      var command = "gzip";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GZipComponent")
      graph.components[0].exec.should.equal("gzip")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Gunzip test', function(){
    it('should create a components with class GrepComponent', function(){
      var command = "gunzip";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GunzipComponent")
      graph.components[0].exec.should.equal("gunzip")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Zcat test', function(){
    it('should create a components with class ZcatComponent', function(){
      var command = "zcat";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("ZcatComponent")
      graph.components[0].exec.should.equal("zcat")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Ls test', function(){
    it('should create a components with class LsComponent', function(){
      var command = "ls";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("LsComponent")
      graph.components[0].exec.should.equal("ls")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })
  describe('Tail test', function(){
    it('should create a components with class TailComponent', function(){
      var command = "tail -n10";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("TailComponent")
      graph.components[0].exec.should.equal("tail")


      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      //graph.components[0].selectors.should.have.properties({
      //  last: { type: 'numeric parameter', name: 'lines', value:10 }
      //})
    })
  }),
  describe('Head test', function(){
    it('should create a components with class HeadComponent', function(){
      var command = "head -n10";
      var graph = shouldBeAGraph(parser.parseCommand(command))

      classname(graph.components[0]).should.equal("HeadComponent")
      graph.components[0].exec.should.equal("head")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      //graph.components[0].selectors.should.have.properties({
      //  last: { type: 'numeric parameter', name: 'lines', value:10 }
      //})
    })
  })

  describe('Diff test', function(){
    it('should create a components with class HeadComponent', function(){
      var command = "diff";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("DiffComponent")
      graph.components[0].exec.should.equal("diff")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      //graph.components[0].selectors.should.have.properties({
      //  last: { type: 'numeric parameter', name: 'lines', value:10 }
      //})
    })
  })
})