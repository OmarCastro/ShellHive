var parser = require('../../target/parser/parser.js')
var should = require("should")
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