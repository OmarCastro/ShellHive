var parser = require('../../lib/parser/parser.js')
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var Connection        = parser.Connection
var Macro             = parser.Macro
var Component  	      = parser.Component
var FileComponent     = parser.FileComponent
var CommandComponent  = parser.CommandComponent
var MacroComponent    = parser.MacroComponent
var IndexedGraph      = parser.IndexedGraph

describe('parser.js test', function(){
  describe('createComponentDinamicText', function(){
    var cComp = parser.createComponentDinamicText;
    it('should not create a component with unknown content',function(){
      should.not.exist(cComp(""));
      should.not.exist(cComp("gas"));
      should.not.exist(cComp("micro rato"));
      should.not.exist(cComp("micro .rato.txt"));

    })
    it('should create a file component', function(){
      cComp("micro_rato.txt").should.be.an.instanceof(FileComponent)
      cComp("micro.rato.txt").should.be.an.instanceof(FileComponent)
    })
    it('should create a command component', function(){
      cComp("cat -A").should.be.an.instanceof(CommandComponent)
        .and.have.properties({
          flags:{
            "show tabs": true,
            "show ends": true,
            "show non-printing": true,
            'squeeze blank': false
          }
        })
    })
  })

  describe('find first component', function(){
    var cComp = parser.createComponentDinamicText;
    it('should find the first component correctly',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      var indexedGraph = new IndexedGraph(graph)
      parser.findFirstComponent(graph.components[0],graph,indexedGraph,{})
        .should.be.equal(graph.components[0])
      parser.findFirstComponent(graph.components[2],graph,indexedGraph,{})
        .should.be.equal(graph.components[0])

    })
  })

  

  describe('cloning graph', function(){
    it('should sucessfully clone',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      var clonedGraph = parser.cloneGraph(graph);
      clonedGraph.toJSON().should.eql(graph.toJSON());
    })

  })


  describe('piping error in graph', function(){
    it('should generate code to save return to text',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      var fileindex = graph.components.length;
      var newfile = new FileComponent("exit.txt")
      newfile.id = graph.counter++;
      graph.components.push(newfile);
      graph.connect(graph.components[0],'error',newfile,'input');
      var resultCode = parser.parseGraph(graph);
      //resultCode.should.equal('(grep  "hello world" cenas.txt; (echo $? > exit.txt)) | grep  mimi')
    })

    it('should generate code to save return to command',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      //var graph2 = parser.parseCommand("grep 0 > file.txt");
      //graph.expand(graph2);
      var graph2 = parser.parseCommand("grep 0 > file.txt");
      graph.expand(graph2);
      graph2.components.forEach(function(component){
        component.id = graph.counter++;
      })
      graph.connect(graph.components[0],'error',graph2.components[0],'input');
      console.error(parser.parseGraph(graph)); 

      //parser.parseGraph(graph).should.equal('(grep  "hello world" cenas.txt; (echo $? | grep  0 > file.txt) &> /dev/null) | grep  mimi'); 

    })

    it('should generate code to save return to 2 components',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      //var graph2 = parser.parseCommand("grep 0 > file.txt");
      //graph.expand(graph2);
      var resultCode = parser.parseGraph(graph);
      console.error(resultCode); 
      var graph2 = parser.parseCommand("grep 0 > file.txt");
      graph.expand(graph2);
      graph2.components.forEach(function(component){
        component.id = graph.counter++;
      })
      graph.connect(graph.components[0],'error',graph2.components[0],'input');
      var newfile = new FileComponent("exit.txt")
      newfile.id = graph.counter++;
      graph.components.push(newfile);
      graph.connect(graph.components[0],'error',newfile,'input');
      console.error(parser.parseGraph(graph)); 

      //parser.parseGraph(graph).should.equal('(grep  "hello world" cenas.txt; (echo $? | grep  0 > file.txt) &> /dev/null) | grep  mimi'); 

    })
  })
  describe('return code graph', function(){
    it('should generate code to save return to text',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      var fileindex = graph.components.length;
      var newfile = new FileComponent("exit.txt")
      newfile.id = graph.counter++;
      graph.components.push(newfile);
      graph.connect(graph.components[0],'retcode',newfile,'input');
      var resultCode = parser.parseGraph(graph);
      resultCode.should.equal('(grep  "hello world" cenas.txt; (echo $? > exit.txt)) | grep  mimi')
    })

    it('should generate code to save return to command',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      //var graph2 = parser.parseCommand("grep 0 > file.txt");
      //graph.expand(graph2);
      var graph2 = parser.parseCommand("grep 0 > file.txt");
      graph.expand(graph2);
      graph2.components.forEach(function(component){
        component.id = graph.counter++;
      })
      graph.connect(graph.components[0],'retcode',graph2.components[0],'input');
      parser.parseGraph(graph).should.equal('(grep  "hello world" cenas.txt; (echo $? | grep  0 > file.txt) &> /dev/null) | grep  mimi'); 

    })

    it('should generate code to save return to 2 components',function(){
      var graph = parser.parseCommand("grep 'hello world' cenas.txt | grep mimi");
      //var graph2 = parser.parseCommand("grep 0 > file.txt");
      //graph.expand(graph2);
      var resultCode = parser.parseGraph(graph);
      console.error(resultCode); 
      var graph2 = parser.parseCommand("grep 0 > file.txt");
      graph.expand(graph2);
      graph2.components.forEach(function(component){
        component.id = graph.counter++;
      })
      graph.connect(graph.components[0],'retcode',graph2.components[0],'input');
      var newfile = new FileComponent("exit.txt")
      newfile.id = graph.counter++;
      graph.components.push(newfile);
      graph.connect(graph.components[0],'retcode',newfile,'input');
      console.error(parser.parseGraph(graph)); 

      //parser.parseGraph(graph).should.equal('(grep  "hello world" cenas.txt; (echo $? | grep  0 > file.txt) &> /dev/null) | grep  mimi'); 

    })

  })

  describe('creating macros', function(){
    it('should create an empty macro',function(){
      var macro = parser.createMacro("mimi","mimimi");
      macro.components.should.have.length(0);
      macro.should.have.properties({
        name: "mimi",
        description: "mimimi"
      })
      var macroComp = new MacroComponent(macro);
      parser.parseComponent(macroComp).should.equal('');
    })


    it('should create a macro from command',function(){
      var macro = parser.createMacro("mimi","mimimi","grep 'hello world' cenas.txt | grep mimi");
      macro.components.should.have.length(3);
      var macroComp = new MacroComponent(macro);
      parser.parseComponent(macroComp).should.equal('grep  "hello world" cenas.txt | grep  mimi');
    })

    it('should create a macro based on another macro',function(){
      var macro = parser.createMacro("mimi","mimimi","grep 'hello world' cenas.txt | grep mimi");
      var otherMacro = parser.createMacro("mimi","mimimi",null, macro);
      macro.components.should.have.length(3);
      var macroComp = new MacroComponent(otherMacro);
      parser.parseComponent(macroComp).should.equal('grep  "hello world" cenas.txt | grep  mimi');
    })

  })

})