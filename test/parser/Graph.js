const parser = require('../../lib/parser/parser.js')
const graphlib = require('../../lib/graph')
const parserinit = require('../../lib/parser/utils/init.js')
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const Connection = graphlib.Connection;
const Component  = graphlib.Component;
const Graph = graphlib.Graph;

function shouldBeAGraph(commandResult){
  commandResult.should.be.an.instanceof(Graph)
  commandResult.components.forEach(function(component){
    component.should.be.an.instanceof(Component)
  });  
  commandResult.connections.forEach(function(component){
    component.should.be.an.instanceof(Connection)
  });
  commandResult.toJSON().should.eql({
    components: commandResult.components,
    connections: commandResult.connections
  })
  return commandResult
}

function reparse(command){
  return function(){
    var graph
    it('should sucessfully parse the command', function(){
      graph = shouldBeAGraph(parser.parseCommand(command))
    })
    it('should parse the same graph after compiling to text', function(){
      var resultCommand = parser.parseVisualData(graph)
      var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
      reGraph.should.eql(graph);
    })
  }
}

describe('Graph test', function(){

  describe('typeOf test', function(){
    it('should work', function(){
      parserinit.typeOf("").should.equal("string");
    })
  })
  describe('basic cat test', function(){
    it('should create 3 components', function(){
    	var command = "cat -s -A file1.txt file2.txt";
    	var graph = parser.parseCommand(command)
      shouldBeAGraph(graph)
      graph.components.should.have.length(3)
      graph.connections.should.have.length(2)


      graph.components[0].should.be.an.instanceof(graphlib.CommandComponent)
      graph.components[1].should.be.an.instanceof(graphlib.FileComponent)
      graph.components[2].should.be.an.instanceof(graphlib.FileComponent)

      graph.components[0].exec.should.equal("cat");

      graph.components[0].flags.should.have.properties({
        "show tabs": true,
        "show ends": true,
        "show non-printing": true
      })
    })
  })
  describe('pipe test', function(){
    it('should create a bunch of component connected each other as pipes', function(){
      var command = 'grep 2004 | cat uselessUseOfCat.txt | grep "oh really" | grep "yes really" | cat | cat | gzip';
      var graph = parser.parseCommand(command)
      shouldBeAGraph(graph)
      graph.components.should.have.length(8)
      graph.connections.should.have.length(7)
      //graph.components[1].should.be.an.instanceof(graphlib.CommandComponent)
      //graph.components[2].should.be.an.instanceof(graphlib.CommandComponent)

      graph.components[0].exec.should.equal("grep");
      graph.components[1].exec.should.equal("cat");
      graph.components[7].exec.should.equal("gzip");

      graph.connections[1].toJSON().should.eql({
        startNode:  graph.components[0].id,
        startPort:  "output",
        endNode: graph.components[1].id,
        endPort: "input"
      })

      //var flags = graph.components[0].flags;

      //flags["show tabs"].should.be.true;
      //flags["show ends"].should.be.true;
      //flags["show non-printing"].should.be.true;

    })
    describe('reparse pipe', reparse('grep 2004 | cat uselessUseOfCat.txt | grep "oh really" | grep "yes really" | cat | cat | gzip'))
  })

  describe('process substitution test', function(){
    it('should create a process substitution tree', function(){
      var command = 'cat <(cat <(grep "cat" cat.cat.txt) <(grep t2 txt.txt)) <(grep 1 min.txt) <(grep 2 max.txt) | cat - <(cat min.txt)';
      var graph = parser.parseCommand(command)
      shouldBeAGraph(graph)
      //graph.components.should.have.length(14)
      //graph.connections.should.have.length(13)

      graph.components[0].exec.should.equal("cat");
      graph.components[1].exec.should.equal("cat");
    })
    describe('reparse process substitution', reparse('cat <(cat <(grep "cat" cat.cat.txt) <(grep t2 txt.txt)) <(grep 1 min.txt) <(grep 2 max.txt) | cat - <(cat min.txt)'))
  })

  describe('redirection test', function(){
    it('should create a component for each output redirection', function(){
      var command = 'cat file1.txt > file2.txt 2> file3.txt';
      var graph = parser.parseCommand(command)
      shouldBeAGraph(graph)
      graph.components.should.have.length(4)
      graph.connections.should.have.length(3)
      
      graph.components[0].exec.should.equal("cat");
      graph.components[1].should.be.an.instanceof(graphlib.FileComponent)
      graph.components[2].should.be.an.instanceof(graphlib.FileComponent)
      graph.components[3].should.be.an.instanceof(graphlib.FileComponent)
    })
    describe('reparse redirection', reparse('cat file1.txt > file2.txt 2> file3.txt'))

  })

  describe('tee test', function(){
    it('should create a tree by using a tee command', function(){
      var command = 'cat | tee >(cat | tee >(cat) >(cat)) >(cat | tee >(cat) >(cat) | cat) | cat';
      var graph = parser.parseCommand(command)
      shouldBeAGraph(graph)
      graph.components.should.have.length(9)
      graph.connections.should.have.length(8)
      graph.components.forEach(function(component){
        component.exec.should.equal("cat");
      })
    })
    describe('to text',function(){
      it('should compile to text without errors', function(){
        var command = 'cat | tee >(cat | tee >(cat) >(cat)) >(cat | tee >(cat) >(cat) | cat) | cat';
        var graph = shouldBeAGraph(parser.parseCommand(command))
        var result = parser.parseVisualData(graph)
        console.error(result);
        result.should.not.equal('');
      })
    })
    //it('should create a tree by using a tee command, using stderr instead', function(){
    //  var command = 'cat 2> >(tee >(cat 2> >(tee >(cat) >(cat))) >(cat 2> >(tee >(cat) >(cat) | cat)) | cat)';
    //  var graph = parser.parseCommand(command)
    //  shouldBeAGraph(graph)
    //  graph.components.should.have.length(9)
    //  graph.connections.should.have.length(8)
    //  graph.components.should.matchEach(function(component){
    //    component.exec.should.equal("cat");
    //  })       
    //})
  })
})