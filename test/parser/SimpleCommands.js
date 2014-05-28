var parser = require('../../lib/parser/parser.js')
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var Connection = parser.Connection
var Component  = parser.Component



function shouldBeAGraph(commandResult){
  commandResult.should.be.an.instanceof(parser.Graph)
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

function classname(classObject){
  return classObject.constructor.name;
}

function reparse(command){
  return function(){
    var graph
    it('should sucessfully parse the command', function(){
      graph = shouldBeAGraph(parser.parseCommand(command))
    });
    it('should parse the same graph after compiling to text', function(){
      var resultCommand = parser.parseVisualData(graph)
      var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
      reGraph.should.eql(graph);
    });
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
  describe('`awk` test', function(){
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
    describe("reparse awk \'{print;}\'", reparse('awk \'{print;}\''));
    describe("reparse awk -F_ '{print $2,$5;}'", reparse("awk -F_ '{print $2,$5;}'"));
    describe("reparse awk -F ' ' '{print $2,$5;}'", reparse("awk -F ' ' '{print $2,$5;}'"));
    describe("reparse awk '$1 >200' employee.txt", reparse('awk \'$1 >200\' employee.txt'));
  })

  describe('`cat` test', function(){
    it('should create a component with class CatComponent', function(){
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
    describe('reparse cat -sA file1.txt', reparse('cat -sA file1.txt'));
    describe('reparse cat -n file1.txt', reparse('cat -n file1.txt'));
    describe('reparse cat -s "/home/super man/file1.txt"', reparse('cat -s "/home/super man/file1.txt"'));
    it('"cat -A" = "cat --show-tabs --show-ends --show-nonprinting"', 
      createsSame('cat -A', 'cat --show-tabs --show-ends --show-nonprinting'));
    it('"cat -bn" = "cat -nb"', createsSame('cat -bn', 'cat -nb'));
    it('"cat -bn" = "cat -b"', createsSame('cat -bn', 'cat -b'));
  })




  describe('`grep` test', function(){
    it('should create a component with class GrepComponent', function(){
      var command = "grep -F";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GrepComponent")
      graph.components[0].exec.should.equal("grep")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })

    describe('reparse grep without arguments', reparse('grep'));
    describe('reparse grep with flags', reparse('grep -F'));
    describe('reparse grep, only pattern', reparse('grep mimi'));
    describe('reparse grep, only pattern ( with spaces )', reparse('grep "mi mi"'));
    describe('reparse grep, only files',function(){
      var graph
      var command       = 'grep "" file1.txt file2.txt'
      it('should sucessfully parse the command', function(){
        graph = shouldBeAGraph(parser.parseCommand(command))
        graph.components.should.have.length(3)
      })
      it('should parse the same graph after compiling to text', function(){
        var resultCommand = parser.parseVisualData(graph)
        var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
        reGraph.should.eql(graph);
      });
    })
    describe('reparse grep, all arguments', reparse('grep mimi file1.txt file3.txt'));
    it('should create the same graph using long option variants', 
      createsSame('grep mimi -F', 'grep mimi --fixed-strings'));

  })




  describe('`gzip` test', function(){
    it('should create a component with class GzipComponent', function(){
      var command = "gzip";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GZipComponent")
      graph.components[0].exec.should.equal("gzip")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse gzip', reparse('gzip'));

  })

  describe('`gunzip` test', function(){
    it('should create a component with class GrepComponent', function(){
      var command = "gunzip";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("GunzipComponent")
      graph.components[0].exec.should.equal("gunzip")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse gunzip', reparse('gunzip'));
  })

  describe('`zcat` test', function(){
    it('should create a component with class ZcatComponent', function(){
      var command = "zcat";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("ZcatComponent")
      graph.components[0].exec.should.equal("zcat")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse zcat file.txt.gz', reparse('zcat file.txt.gz'));
  })

  describe('`bzip` test', function(){
    it('should create a component with class BZipComponent', function(){
      var command = "bzip2";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BZipComponent")
      graph.components[0].exec.should.equal("bzip2")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse bzip2', reparse('bzip2'));

  })

  describe('`bzcat` test', function(){
    it('should create a component with class BzcatComponent', function(){
      var command = "bzcat";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BzcatComponent")
      graph.components[0].exec.should.equal("bzcat")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse bzcat', reparse('bzcat'));
  })

  describe('`bunzip` test', function(){
    it('should create a component with class BunzipComponent', function(){
      var command = "bunzip2";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("BunzipComponent")
      graph.components[0].exec.should.equal("bunzip2")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse bunzip2', reparse('bunzip2'));
  })

  describe('`compress` test', function(){
    it('should create a component with class CompressComponent', function(){
      var command = "compress";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("CompressComponent")
      graph.components[0].exec.should.equal("compress")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse compress', reparse('compress'));
  })

    describe('`diff` test', function(){
    it('should create a component with class DiffComponent', function(){
      var command = "diff";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("DiffComponent")
      graph.components[0].exec.should.equal("diff")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty

    })
    describe('reparse diff, two files - ', reparse('diff file1.txt file2.txt'));
    describe('reparse diff, two processes -', reparse('diff <(grep "nope" file1.txt) <(grep "nope" file3.txt)'));
  })

  describe('`ls` test', function(){
    it('should create a component with class LsComponent', function(){
      var command = "ls -1";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("LsComponent")
      graph.components[0].exec.should.equal("ls")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].flags.should.have.properties({})
    })
    describe('reparse ls, long option variant',function(){
      var graph
      var command       = 'ls --quoting-style=shell'
      it('should sucessfully parse the command', function(){
        graph = shouldBeAGraph(parser.parseCommand(command))
        graph.components[0].selectors.should.have.properties({
          "quoting style":{type:"option", name:"shell"}
        });
      })
      it('should parse the same graph after compiling to text', function(){
        var resultCommand = parser.parseVisualData(graph)
        var reGraph       = shouldBeAGraph(parser.parseCommand(resultCommand))
        reGraph.should.eql(graph);
      });
    })
    describe('reparse ls alternate variants', reparse('ls -l --quoting-style=shell -v'));
    it('should create the same graph', 
      createsSame('ls -l --quoting-style=shell -v', 'ls -lv --quoting-style=shell'));
  })

  describe('`tr` test', function(){
    it('should create a component with class TrComponent', function(){
      var command = "tr man woman";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("TrComponent")
      graph.components[0].exec.should.equal("tr")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].should.have.properties({
        "set1":"man",
        "set2":"woman"
      })
    })
    describe('reparse tr', reparse('tr man woman'));

  })

  describe('`tail` test', function(){
    it('should create a component with class TailComponent', function(){
      var command = "tail -n10";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("TailComponent")
      graph.components[0].exec.should.equal("tail")


      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].selectors.should.have.properties({
        last: { type: 'numeric parameter', name: 'lines', value:10 }
      })
      parser.parseGraph(graph).should.equal(command);
    })
  }),
  describe('`head` test', function(){
    it('should create a component with class HeadComponent', function(){
      var command = "head -n10";
      var graph = shouldBeAGraph(parser.parseCommand(command))

      classname(graph.components[0]).should.equal("HeadComponent")
      graph.components[0].exec.should.equal("head")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].selectors.should.have.properties({
        first: {
          type: 'numeric parameter', name: 'lines',  value:10
        }
      })
      parser.parseGraph(graph).should.equal(command);
    })
  })


    describe('`curl` test', function(){
    it('should create a component with class CurlComponent', function(){
      var command = "curl https://gnomo.fe.up.pt";
      var graph = shouldBeAGraph(parser.parseCommand(command))

      classname(graph.components[0]).should.equal("CurlComponent")
      graph.components[0].exec.should.equal("curl")

      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      graph.components[0].parameters.should.have.properties({
        url: "https://gnomo.fe.up.pt"
      })
      parser.parseGraph(graph).should.equal(command);
    })
  })


  describe('`date` test', function(){
    it('should create a component with class DateComponent', function(){
      var command = "date";
      var graph = shouldBeAGraph(parser.parseCommand(command))
      classname(graph.components[0]).should.equal("DateComponent")
      graph.components[0].exec.should.equal("date")
      graph.components.should.have.length(1)
      graph.connections.should.be.empty
      //graph.components[0].selectors.should.have.properties({
      //  last: { type: 'numeric parameter', name: 'lines', value:10 }
      //})
    })
    describe('reparse date', reparse('date -u'));

    it('should create the same graph', 
      createsSame('date -d mimi', 'date mimi'));
    it('should create the same graph', 
      createsSame('date --utc', 'date --universal'));
  })
})