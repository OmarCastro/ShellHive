/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
function get-CSS-supported-prop(proparray)
    root=document.documentElement
    for i in proparray
        if i of root.style
            return i 

cssTransform = get-CSS-supported-prop <[transform WebkitTransform MozTransform]>

isImplemented = (data) ->
  ([
    'cat'
    'grep'
    'bunzip2'
    'bzcat'
    'bzip2'
    'compress'
    'ls'
    \gzip
    \gunzip
    \zcat
  ].indexOf data.exec) >= 0

SelectionOptions = shellParser.VisualSelectorOptions

console.log "SelectionOptions"
console.log SelectionOptions



app = angular.module('report', [])

app.controller 'examples', ($scope) ->
  $scope.options = SelectionOptions
  examples =
    * title:"ls",
      command: "ls -BartIsaCoolGuy"
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
    * title:"ls2",
      command: "ls -BartI saCoolGuy"
    * title:"gzip",
      command: "gzip file1.txt.gz"
    * title:"gunzip",
      command: "gunzip file1.txt.gz"
    * title:"zcat",
      command: "zcat file1.txt.gz"
    * title:"compress",
      command: "compress file1.txt.gz"

  results = for example,index in examples
    AST = shellParser.generateAST example.command
    visualData = shellParser.parseAST AST
    AST = JSON.stringify AST, ``undefined``, 2
    {
      id: index
      example.title
      example.command
      AST: AST
      visualData: visualData
      JSONVisualData: JSON.stringify visualData, ``undefined``, 2
    }

  $scope
    ..TransformResults = results
    ..tab = results.0.id
    ..updateTab = (id) -> $scope.tab = id
    ..isImplemented = isImplemented



app.controller 'visual2text', ($scope) ->
    $scope.updateTab = (id) -> $scope.tab = id
    $scope.isImplemented = isImplemented
    $scope.options = SelectionOptions
    examples =
      * title: 'cat'
        command: 'cat -s -A cat.txt grep.txt'
      * title: 'grep'
        command: 'grep -E "we are the champions" queens_lyrics.txt'
    results = []
    $scope.TransformResults = results;
    for example,i in examples
      example = examples[i]
      AST = shellParser.generateAST example.command
      visualData = shellParser.parseAST AST
      results.push {
        id: i
        example.title
        example.command
        visualData: visualData
        JSONVisualData: JSON.stringify(visualData,void, 2)
      }
      let indx = i
        $scope.$watch "TransformResults[#indx].visualData.components", ((newValue)->
          $scope.TransformResults[indx]
            ..command = shellParser.parseComponent newValue[0]
            ..JSONVisualData = JSON.stringify(newValue,void, 2)
          console.log '!!!'
        ), true
    $scope.tab = results[0].id



app.controller 'ASTTester', ($scope) ->
  $scope.updateTab = (id) -> $scope.tab = id

  tests = 
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
        'equals(ast[0].args[3],["errTo","file2.txt"])'
        'equals(ast[0].args[4],["out&errTo","file2.txt"])'
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


  testResults = for test,index in tests
    ast = shellParser.generateAST test.command
    results = for assert in test.asserts
      result = (new Function 'ast', 'equals', 'return ' + assert) angular.copy(ast), angular.equals
      {
        command: assert
        result: result
        class: if result is true then 'passed' else 'failed'
      }
    {
        id: index
        test.title
        test.command
        ast: JSON.stringify(ast,void, 2)
        results: results
    }

  $scope.testResults = testResults
  $scope.tab = testResults.0.id




app.controller 'ast-playground', ($scope) ->
    $scope.builder = {
      code: ''
      result: ''
      error: false
    }
    $scope.generateAST = ->
      builder = $scope.builder
      return builder.result = '' if builder.code is ''
      try
        builder.result = JSON.stringify(shellParser.generateAST(builder.code), void, 2)
        builder.error = false
      catch err
        builder.error = true
        builder.result = 'compilation error \n' + err.message.split('\n').slice(1, 3).join('\n')

app.controller 'visual-playground', ($scope) ->
  emptyresult = {
    components:[]
    connections:[]
  }

  $scope.generateAST = ->
    builder = $scope.builder
    return builder.result = false if builder.code is ''
    try
      builder.result = shellParser.parseCommand(builder.code)
      console.log $scope.builder
      builder.error = false
    catch err
      builder.error = 'compilation error \n' + err.stack
      builder.result = emptyresult
      throw err


  $scope
    ..screenHeight = window.screen.availHeight
    ..options = SelectionOptions
    ..isImplemented = isImplemented
    ..builder =
      code: 'cat <( cat<(grep txt) <(grep t2) ) <(grep 2) <(grep 2)'
      result: ''
      error: false

  translateX = 0
  translateY = 0
  startX = 0
  startY = 0
  elembuilder = document.querySelector(".playGround .visual-builder")
  angular.element(elembuilder).bind "pointerdown", (event) !->
    targetTag = event.target.tagName
    return if pointerId || targetTag in <[INPUT SELECT LABEL]>
    pointerId = event.pointerId
    angular.element(document)
      ..bind "pointermove", mousemove
      ..bind "pointerup", mouseup
    startX := event.screenX 
    startY := event.screenY 
    event.preventDefault!
    event.stopPropagation!
  mousemove = (event) !->
    translateX := event.screenX - startX
    translateY := event.screenY - startY
    startX := event.screenX
    startY := event.screenY
    for elem in elembuilder.querySelectorAll(".component")
      angular.element(elem).scope().moveTo(translateX,translateY)
    for elem in elembuilder.querySelectorAll("svg path")
      angular.element(elem).scope().update!
    $scope.$digest!
  mouseup = ->
    pointerId = 0
    angular.element(document)
      ..unbind "pointermove", mousemove
      ..unbind "pointerup", mouseup
  $scope.generateAST!



app.controller 'data-flow', ($scope) ->
  $scope.options = SelectionOptions
  connectors = []
  examples =
    * title:"single",
      command: "ls -BartIsaCoolGuy"
    * title:"process substitution",
      command: "cat <(grep 2004 events.txt) <(grep 1958 ye_olde_events.txt)"
    * title:"process substitution tree",
      command: "cat <( cat<(grep txt) <(grep t2) ) <(grep 2) <(grep 2)"
    * title:"pipe",
      command: "grep 2004 | cat uselessUseOfCat.txt | cat | cat | cat | cat"

  results = for example,index in examples
    AST = shellParser.generateAST example.command
    visualData = shellParser.parseAST AST
    connectors.push visualData.connections
    delete visualData.connections
    AST = JSON.stringify AST, ``undefined``, 2
    {
      id: index
      example.title
      example.command
      AST: AST
      visualData: visualData
      JSONVisualData: JSON.stringify visualData, ``undefined``, 2
    }

  translateX = 0
  translateY = 0
  startX = 0
  startY = 0
  requestAnimationFrame ->
    elembuilders = document.querySelectorAll(".visual-builder.data-flow")
    console.log document.querySelectorAll(".visual-builder")
    console.log connectors
    for elembuild,index in elembuilders
      $scope.TransformResults[index].visualData.connections = connectors[index]
      let elembuilder = elembuild
        angular.element(elembuilder).bind "pointerdown", (event) !->
          targetTag = event.target.tagName
          return if pointerId || targetTag in <[INPUT SELECT LABEL]>
          pointerId = event.pointerId
          angular.element(document)
            ..bind "pointermove", mousemove
            ..bind "pointerup", mouseup
          startX := event.screenX 
          startY := event.screenY 
          event.preventDefault!
          event.stopPropagation!
        mousemove = (event) !->
          translateX := event.screenX - startX
          translateY := event.screenY - startY
          startX := event.screenX
          startY := event.screenY
          for elem in elembuilder.querySelectorAll(".component")
            angular.element(elem).scope().moveTo(translateX,translateY)
          for elem in elembuilder.querySelectorAll("svg path")
            angular.element(elem).scope().update!
          $scope.$digest!
        mouseup = ->
          pointerId = 0
          angular.element(document)
            ..unbind "pointermove", mousemove
            ..unbind "pointerup", mouseup    
    $scope.$digest!
    console.log $scope.TransformResults

  $scope
    ..TransformResults = results
    ..screenHeight = window.screen.availHeight
    ..tab = results.0.id
    ..updateTab = (id) -> $scope.tab = id
    ..isImplemented = isImplemented


app.directive "connector", ($document) ->
    scope:true
    link: (scope, element, attr) !->

      var Startnode, StartPort, Endnode, EndPort, 
        childOffset1, childOffset2, 
        startPosition, endPosition,
        startComponent, endComponent
      
      resultScope = scope;
      while !resultScope.hasOwnProperty("visualData") && resultScope != scope.$root
        resultScope = resultScope.$parent
      dataedge = scope.$parent.edge
      elem = element[0]
      graphElement = elem.parentElement.parentElement



      setEdgePath = (iniX,iniY,endX,endY) ->
        xpoint = (endX - iniX)/4
        elem.setAttribute \d,"M #iniX #iniY H #{iniX+0.5*xpoint} C #{iniX+2*xpoint},#iniY #{iniX+xpoint*2},#endY #{iniX+xpoint*4},#endY H #endX"
      
      for component in resultScope.visualData.components
        if component.id == dataedge.startNode
          startComponent := component
          startPosition  := component.position
          break

      for component in resultScope.visualData.components
        if component.id == dataedge.endNode
          endComponent := component
          endPosition  := component.position
          break


      update = ->
        setEdgePath(
          startPosition.x+childOffset1.left,
          startPosition.y+childOffset1.top,
          endPosition.x+childOffset2.left,
          endPosition.y+childOffset2.top
        )
      scope.update = update
      scope.updateWithId = (id) !-> update! if dataedge.startNode == id or dataedge.endNode == id
      requestAnimationFrame ->
        Startnode := document.querySelector(".playGround .nodes .component[data-node-id='#{dataedge.startNode}']")
        StartPort := Startnode.querySelector(".box[data-port='#{dataedge.startPort}']")
        Endnode := document.querySelector(".playGround .nodes .component[data-node-id='#{dataedge.endNode}']")
        EndPort := Endnode.querySelector(".box[data-port='#{dataedge.endPort}']")
        childOffset1 := {
            top: StartPort.offsetTop + StartPort.offsetHeight*0.75,
            left: StartPort.offsetLeft
        }
        childOffset2 := {
            top: EndPort.offsetTop + EndPort.offsetHeight,
            left: EndPort.offsetLeft 
        }
        update!

app.directive "component", ($document) ->
    pointerId = 0
    scope:true
    link: (scope, element, attr) !->
      scope.transform = cssTransform.replace(/[A-Z]/g,(v)->"-#{v.toLowerCase()}")
      datanode = scope.$parent.data
      startX = 0
      startY = 0
      title = datanode.title
      position = datanode.position
      elem = element[0];
      imstyle = elem.style
      scope.moveTo = (newX, newY) !-> 
        position.x += newX
        position.y += newY
      element.bind "pointerdown", (event) !->
        targetTag = event.target.tagName
        return if pointerId || targetTag in <[INPUT SELECT LABEL]>
        pointerId = event.pointerId
        $document
          ..bind "pointermove", mousemove
          ..bind "pointerup", mouseup
        startX := event.screenX
        startY := event.screenY
        event.preventDefault!
        event.stopPropagation!
      mousemove = (event) !->
        moveTo event.screenX - startX,event.screenY - startY
        startX := event.screenX
        startY := event.screenY
      moveTo = (newX, newY) !-> 
        position.x += newX
        position.y += newY
        scope.$digest!
        for el in elem.parentElement.parentElement.querySelectorAll("svg path")
          angular.element(el).scope().updateWithId(datanode.id)
      mouseup = ->
        pointerId = 0
        $document
          ..unbind "pointermove", mousemove
          ..unbind "pointerup", mouseup

 