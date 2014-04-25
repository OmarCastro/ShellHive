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

function reparse(command){
  return function(){
    var graph         = shouldBeAGraph(parser.parseCommand(command))
    var resultCommand = parser.parseVisualData(graph)
    var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
    reGraph.should.eql(graph);
  }
}

function createsSame(command1, command2){
  return function(){
    var graph         = shouldBeAGraph(parser.parseCommand(command1))
    var reGraph       = shouldBeAGraph(parser.parseCommand(command2))
    reGraph.should.eql(graph);
  }
}


describe('command test', function(){
  describe('Awk test compile to component', function(){
    it('should create a component with class AwkComponent', function(){
      var command = 'awk -Fmi "mimi"';
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("AwkComponent")
      graph.components[0].exec.should.equal("awk")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].should.have.properties({
        "script": "mimi",
        parameters:{"field separator": "mi"}
      })
    })
    it('should parse the same graph after compiling to text', reparse('awk "mimi"'));
    it('should parse the same graph after compiling to text', reparse('awk -Fmi "mimi"'));
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
    it('should parse the same graph after compiling to text', reparse('cat -sA file1.txt'));
    it('"cat -A" = "cat --show-tabs --show-ends --show-nonprinting"', 
      createsSame('cat -A', 'cat --show-tabs --show-ends --show-nonprinting'));
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
    it('should parse the same graph after compiling to text, without arguments', 
      reparse('grep'));
    it('should parse the same graph after compiling to text, only pattern',
      reparse('grep mimi'));
    it('should parse the same graph after compiling to text, only pattern ( with spaces )',
      reparse('grep "mi mi"'));
    it('should parse the same graph after compiling to text, only files',function(){
    var command       = 'grep "" file1.txt file2.txt'
    var graph         = shouldBeAGraph(parser.parseCommand(command))
    graph.components.should.have.length(3)
    var resultCommand = parser.parseVisualData(graph)
    var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
    reGraph.should.eql(graph);
  })
    it('should parse the same graph after compiling to text, all arguments',
      reparse('grep mimi file1.txt file3.txt'));
    it('using long variants should create the same graph', 
      createsSame('grep mimi -F', 'grep mimi --fixed-strings'));

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
    it('should parse the same graph after compiling to text', reparse('gzip'));

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
    it('should parse the same graph after compiling to text', reparse('gunzip'));

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
    it('should parse the same graph after compiling to text', reparse('zcat file.txt.gz'));

  })

  describe('Bzip test', function(){
    it('should create a components with class BZipComponent', function(){
      var command = "bzip2";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BZipComponent")
      graph.components[0].exec.should.equal("bzip2")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Bzcat test', function(){
    it('should create a components with class BzcatComponent', function(){
      var command = "bzcat";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BzcatComponent")
      graph.components[0].exec.should.equal("bzcat")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Bunzip test', function(){
    it('should create a components with class BunzipComponent', function(){
      var command = "bunzip2";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BunzipComponent")
      graph.components[0].exec.should.equal("bunzip2")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
  })

  describe('Compress test', function(){
    it('should create a components with class CompressComponent', function(){
      var command = "compress";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("CompressComponent")
      graph.components[0].exec.should.equal("compress")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
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

  describe('Tr test', function(){
    it('should create a components with class TrComponent', function(){
      var command = "tr man woman";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("TrComponent")
      graph.components[0].exec.should.equal("tr")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    it('should parse the same graph after compiling to text', reparse('tr man woman'));

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