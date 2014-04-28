var parser = require('../../target/parser/parser.js')

describe('AST test', function(){
  describe('basic test', function(){
    it('should create an AST with only one command', function(){
    	var command = "cat -s -A file1.txt file2.txt";
    	var ast = parser.generateAST(command)
      ast.length.should.equal(1);
      ast[0].exec.should.equal("cat")
      ast[0].args.should.eql(["-s","-A","file1.txt","file2.txt"])
    })
  })
  describe('redirection test', function(){
    it('should create a component with the same title as the command', function(){
    	var command = "grep line < file1.txt > file2.txt 2> file3.txt &> file4.txt";
    	var ast = parser.generateAST(command)
  		ast[0].args[1].should.eql(["inFromFile","file1.txt"]);
      ast[0].args[2].should.eql(["outToFile","file2.txt"]);
      ast[0].args[3].should.eql(["errToFile","file3.txt"]);
      ast[0].args[4].should.eql(["out&errToFile","file4.txt"]);
    })
  })
  describe('quoted arguments test', function(){
    it('should create a component with the same title as the command', function(){
    	var command = "cat \"in a galaxy.txt\" 'far far away.txt'";
    	var ast = parser.generateAST(command)
      ast[0].exec.should.eql("cat");
      ast[0].args.should.eql(["in a galaxy.txt","far far away.txt"]);
    })
  })
  describe('process substitution output test', function(){
    it('should create a component with the same title as the command', function(){
    	var command = "tee >(grep line2 > file1.txt) >(grep line > file2.txt)";
    	var ast = parser.generateAST(command)
  		ast[0].exec.should.equal("tee");
      ast[0].args[0][0].should.equal("outToProcess");
      ast[0].args[1][0].should.equal("outToProcess");
    })
  })
  describe('process substitution input test', function(){
    it('should create a component with the same title as the command', function(){
    	var command = "diff <(zcat file1.txt.gz) <(zcat file2.txt.gz)";
    	var ast = parser.generateAST(command)
  		ast[0].exec.should.equal("diff");
      ast[0].args[0][0].should.equal("inFromProcess");
      ast[0].args[1][0].should.equal("inFromProcess");
    })
  })
  describe('pipes test', function(){
    it('should create an AST with two command', function(){
    	var command = "cat file1.txt | grep line";
    	var ast = parser.generateAST(command)
  		ast.length.should.equal(2);
      ast[0].exec.should.equal("cat");
      ast[1].exec.should.equal("grep");
      ast[0].args.should.eql(["file1.txt"]);
      ast[1].args.should.eql(["line"]);
    })
  })
  describe('complex command test', function(){
    it('should pass, using the rules in the previous tests', function(){
    	var command = "ls parser/commands/dev/   | parallel 'find parser/commands/dev/{} -newer parser/commands/v/{.}.js' | parallel 'basename {}'";
    	var ast = parser.generateAST(command)
  		ast.length.should.equal(3)
      ast[0].exec.should.equal("ls")
      ast[1].exec.should.equal("parallel")
      ast[2].exec.should.equal(ast[1].exec)
      ast[0].args.should.eql(["parser/commands/dev/"])
      ast[1].args.should.eql(["find parser/commands/dev/{} -newer parser/commands/v/{.}.js"])
      ast[2].args.should.eql(["basename {}"])
    })
  })
})
