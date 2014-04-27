var should = require('should')

var parser  = require('../../target/parser/parser.js')
var graph   = require('../../target/common/graph.js')
var GraphComponent  = graph.GraphComponent
var Graph           = graph.Graph
var Boundary        = graph.Boundary

describe('common module test', function(){

  describe('Graph', function(){
    var graphcomponent;
    it('should sucessfully connect a graph component', function(){
      var graph1 = parser.parseCommand("grep 'hello world' cenas.txt");
      var graph2 = parser.parseCommand("grep 'hello world' cenas.txt");
      graph1.connections = [];
      var c1 = graph1.components[0],
          c2 = graph1.components[1]
      graph1.connect(c2, "output", c1, "file0")
      graph1.should.eql(graph2);
    })
  })

  describe('GraphComponent', function(){
  	var graphcomponent;
    it('should create a graph component', function(){
    	graphcomponent = new GraphComponent();
      graphcomponent.type.should.equal(GraphComponent.type)
    	graphcomponent.components.should.have.length(0)
    	graphcomponent.connections.should.have.length(0)
    })
    it('while setting the same graph, should have the same components', function(){
    	var graph = parser.parseCommand("grep 'hello world' cenas.txt");
    	graphcomponent.setGraphData(graph)
    	graphcomponent.components.should.eql(graph.components)
    	graphcomponent.connections.should.eql(graph.connections)
    })
  })

  describe('Boundary', function(){
    var graphcomponent;
    it('should not create a Boundary', function(){
     should.not.exist(Boundary.createFromComponents([]));
    })
    it('should not create Boundary and translate by x', function(){
     var b1 = new Boundary(0,0,0,0,[]);
     var b2 = new Boundary(0,0,0,0,[]);
     b1.translateXY(10,0); b2.translateXY(10);
     b1.should.eql(b2);
    })
  })
})