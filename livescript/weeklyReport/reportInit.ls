examples-controller-data =
  * title:"awk",
    command:"awk --field-separator=fs 'print fs'"
  * title:"cat",
    command:"cat -s -A cat.txt grep.txt"
  * title:"grep",
    command:"grep -E ola my.txt"
  * title:"bzip2",
    command: "bzip2 file1.txt"
  * title:"bzcat",
    command: "bzcat file1.txt.bz2"
  * title:"bunzip2",
    command: "bunzip2 file1.txt.bz2"
  * title:"ls",
    command: "ls -BartIsACoolGuy"
  * title:"gzip",
    command: "gzip file1.txt.gz"
  * title:"gunzip",
    command: "gunzip file1.txt.gz"
  * title:"zcat",
    command: "zcat file1.txt.gz"
  * title:"compress",
    command: "compress file1.txt.gz"
  * title:"head",
    command: "head file1.txt"
  * title:"tail",
    command: "tail file1.txt"
  #* title:"tr",
  #  command: "tr man no"
  #* title:"date",
  #  command: "date"

visual2text-controller-data =
  * title: 'cat'
    command: 'cat -s -A cat.txt grep.txt'
  * title: 'grep'
    command: 'grep -E "we are the champions" queens_lyrics.txt'
  * title:"bzip2",
    command: "bzip2 file1.txt"
  * title:"bzcat",
    command: "bzcat file1.txt.bz2"
  * title:"bunzip2",
    command: "bunzip2 file1.txt.bz2"
  * title:"ls",
    command: "ls -BartIsACoolGuy"
  * title:"gzip",
    command: "gzip file1.txt.gz"
  * title:"gunzip",
    command: "gunzip file1.txt.gz"
  * title:"zcat",
    command: "zcat file1.txt.gz"
  * title:"compress",
    command: "compress file1.txt.gz"
  * title:"head",
    command: "head file1.txt"
  * title:"tail",
    command: "tail file1.txt"
  #* title:"tr",
  #  command: "tr man no"
  #* title: "date",
  #  command: "date"


dataFlowExamples =
    * title:"single",
      command: "cat -A"
    * title:"single2",
      command: "ls -IAmACoolGuy"
    * title:"redirections",
      command: "cat file1.txt > file2.txt 2> file3.txt"
    * title:"pipe",
      command: """grep 2004 | cat uselessUseOfCat.txt | grep "oh really" | grep "yes really" | cat | cat | gzip"""
    * title:"process substitution",
      command: "cat <(grep 2004 events.txt) <(grep 1958 ye_olde_events.txt)"
    * title:"tee",
      command: "cat | tee >(cat) >(cat) | cat"
    * title:"tee tree",
      command: "cat | tee >(cat | tee >(cat) >(cat)) >(cat | tee >(cat) >(cat) | cat) | cat"
    * title:"process substitution tree",
      command: "cat <(cat <(grep \"cat\" cat.cat.txt) <(grep t2 txt.txt)) <(grep 1 min.txt) <(grep 2 max.txt) | cat - <(cat min.txt)"
    * title:"p.subst. + tee + pipe",
      command: "grep 'knights of ni' <(cat <(grep txt | tee >(bzip2) | cat) - <(grep t2 ni.txt))"
    * title:"a long workflow",
      command: "grep 'for test purposes only' <(cat - <(grep 1 txt.txt) <(grep t2 txt2.txt)) <(grep 2 txt.txt) <(grep 3 txt2.txt) | 
                cat - <(cat <(grep txt) <(grep t2)) | cat | grep 'its complex alright' 
                <(cat <(grep txt | tee >(bzip2) | cat) - <(grep t2 ni.txt)) | tee >(bzip2) >(grep mimi <(cat ni.txt) | cat | tee >(cat | gzip) | bzip2) | grep | tee >(bzip2) | gzip"

AST_tests = 
  * title: "basic test",
    command: "cat -s -A file1.txt file2.txt",
    asserts: [
      'equals(ast.length,1) // ast is the result of the AST tree',
      'equals(ast[0].exec,"cat")',
      'equals(ast[0].args,["-s","-A","file1.txt","file2.txt"])'
    ]  
  * title: "failure test",
    command: "cat -s -A file1.txt file2.txt",
    asserts: [
      'equals(ast[0].exec,"catt")     // should fail',
      'equals(ast[0].exec,"cat")                                // should pass',
      'equals(ast[0].args,["-s","-A","file1.txt"])              // should fail',
      'equals(ast[0].args,["-s","-A","file1.txt","file2.txt"])  // should pass'
    ]
  * title: "redirection",
    command: "grep line < file1.txt > file2.txt 2> file3.txt &> file4.txt",
    asserts: [
      'equals(ast[0].exec,"grep")',
      'equals(ast[0].args[1],["inFrom","file1.txt"])',
      'equals(ast[0].args[2],["outTo","file2.txt"])'
      'equals(ast[0].args[3],["errTo","file3.txt"])'
      'equals(ast[0].args[4],["out&errTo","file4.txt"])'
    ]
  * title: "quoted arguments",
    command: "cat \"in a galaxy.txt\" 'far far away.txt'",
    asserts: [
      'equals(ast[0].exec,"cat")',
      'equals(ast[0].args,["in a galaxy.txt","far far away.txt"])'
    ]
  * title: "process substitution output",
    command: "tee >(grep line2 > file1.txt) >(grep line > file2.txt)",
    asserts: [
      'equals(ast[0].exec,"tee")',
      'equals(ast[0].args[0][0],"outToProcess")',
      'equals(ast[0].args[1][0],"outToProcess")'
    ]
  * title: "process substitution input",
    command: "diff <(zcat file1.txt.gz) <(zcat file2.txt.gz)",
    asserts: [
      'equals(ast[0].exec,"diff")',
      'equals(ast[0].args[0][0],"inFromProcess")',
      'equals(ast[0].args[1][0],"inFromProcess")'
    ]
  * title: "pipes",
    command: "cat file1.txt | grep line",
    asserts: [
      'equals(ast.length,2)',
      'equals(ast[0].exec,"cat")',
      'equals(ast[1].exec,"grep")',
      'equals(ast[0].args,["file1.txt"])',
      'equals(ast[1].args,["line"])'
    ]
  * title: "complex command",
    command: "ls parser/commands/dev/   | parallel 'find parser/commands/dev/{} -newer parser/commands/v/{.}.js' | parallel 'basename {}'",
    asserts: [
      'equals(ast.length,3)',
      'equals(ast[0].exec,"ls")',
      'equals(ast[1].exec,"parallel")',
      'equals(ast[2].exec,ast[1].exec)',
      'equals(ast[0].args,["parser/commands/dev/"])',
      'equals(ast[1].args,["find parser/commands/dev/{} -newer parser/commands/v/{.}.js"])',
      'equals(ast[2].args,["basename {}"])'
    ]


      #cat chapter1.tex | sed -e "s/''//g" -e "s/[\`\%]//g" -e 's/[][(){}\,\.\;\:\<\>\-\"\~\ =]/\n/g' -e 's/^[ \t]*//' | sort | uniq -c
      #cat chapter1.tex | tr " " "\n" | sort | uniq -c

app = angular.module('report', ['ui.bootstrap','ui.layout']);