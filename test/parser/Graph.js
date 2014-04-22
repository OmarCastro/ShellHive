var parser = require('../../target/parser/parser.js')

describe('Graph test', function(){
  describe('basic cat test', function(){
    it('should create 3 components', function(){
    	var command = "cat -s -A file1.txt file2.txt";
    	var graph = parser.parseCommand(command)
      graph.should.be.an.instanceof(parser.Graph)
      graph.components.length.should.equal(3)
      graph.connections.length.should.equal(2)

      graph.components.forEach(function(component){
        component.should.be.an.instanceof(parser.Component)
      })      

      graph.connections.forEach(function(connection){
        connection.should.be.an.instanceof(parser.Connection)
      })

      graph.components[0].should.be.an.instanceof(parser.CommandComponent)
      graph.components[1].should.be.an.instanceof(parser.FileComponent)
      graph.components[2].should.be.an.instanceof(parser.FileComponent)

      graph.components[0].exec.should.equal("cat");

      var flags = graph.components[0].flags;

      flags["show tabs"].should.be.true;
      flags["show ends"].should.be.true;
      flags["show non-printing"].should.be.true;

    })
  })
  describe('pipe test', function(){
    it('should create a bunch of component connected each other as pipes', function(){
      var command = 'grep 2004 | cat uselessUseOfCat.txt | grep "oh really" | grep "yes really" | cat | cat | gzip';
      var graph = parser.parseCommand(command)
      graph.should.be.an.instanceof(parser.Graph)
      graph.components.length.should.equal(8)
      graph.connections.length.should.equal(7)

      graph.components.forEach(function(component){
        component.should.be.an.instanceof(parser.Component)
      })      

      graph.connections.forEach(function(connection){
        connection.should.be.an.instanceof(parser.Connection)
      })
      //graph.components[1].should.be.an.instanceof(parser.FileComponent)
      //graph.components[2].should.be.an.instanceof(parser.FileComponent)

      graph.components[0].exec.should.equal("grep");
      graph.components[1].exec.should.equal("cat");
      graph.components[7].exec.should.equal("gzip");

      //var flags = graph.components[0].flags;

      //flags["show tabs"].should.be.true;
      //flags["show ends"].should.be.true;
      //flags["show non-printing"].should.be.true;

    })
  })

  describe('process substitution test', function(){
    it('should create a process substitution tree', function(){
      var command = 'cat <(cat <(grep "cat" cat.cat.txt) <(grep t2 txt.txt)) <(grep 1 min.txt) <(grep 2 max.txt) | cat - <(cat min.txt)';
      var graph = parser.parseCommand(command)
      graph.should.be.an.instanceof(parser.Graph)
      graph.components.length.should.equal(14)
      graph.connections.length.should.equal(13)

      graph.components.forEach(function(component){
        component.should.be.an.instanceof(parser.Component)
      })      

      graph.connections.forEach(function(connection){
        connection.should.be.an.instanceof(parser.Connection)
      })
      graph.components[0].exec.should.equal("cat");
      graph.components[1].exec.should.equal("cat");
    })
  })

  describe('redirection test', function(){
    it('should create a component for each output redirection', function(){
      var command = 'cat file1.txt > file2.txt 2> file3.txt';
      var graph = parser.parseCommand(command)
      graph.should.be.an.instanceof(parser.Graph)
      graph.components.length.should.equal(4)
      graph.connections.length.should.equal(3)

      graph.components.forEach(function(component){
        component.should.be.an.instanceof(parser.Component)
      })      

      graph.connections.forEach(function(connection){
        connection.should.be.an.instanceof(parser.Connection)
      })
      
      graph.components[0].exec.should.equal("cat");
      graph.components[1].should.be.an.instanceof(parser.FileComponent)
      graph.components[2].should.be.an.instanceof(parser.FileComponent)
      graph.components[3].should.be.an.instanceof(parser.FileComponent)
    })
  })

  describe('tee test', function(){
    it('should create a tree by using a tee command', function(){
      var command = 'cat | tee >(cat | tee >(cat) >(cat)) >(cat | tee >(cat) >(cat) | cat) | cat';
      var graph = parser.parseCommand(command)
      graph.should.be.an.instanceof(parser.Graph)
      graph.components.length.should.equal(9)
      graph.connections.length.should.equal(8)
      graph.components.forEach(function(component){
        component.should.be.an.instanceof(parser.Component)
        component.exec.should.equal("cat");
      })      
      graph.connections.forEach(function(connection){
        connection.should.be.an.instanceof(parser.Connection)
      })
    })
  })
})