app.controller 'examples', ($scope) ->
  $scope.options = SelectionOptions
  examples = examples-controller-data
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
    examples = visual2text-controller-data
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
      }
      let indx = i
        $scope.$watch "TransformResults[#indx].visualData.components", ((newValue)->
          results[indx].command = shellParser.parseVisualData results[indx].visualData
        ), true
    $scope.tab = results[0].id



app.controller 'ASTTester', ($scope) ->
  $scope.updateTab = (id) -> $scope.tab = id
  tests = AST_tests
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
    return builder.result = emptyresult if builder.code is ''
    try
      builder.result = shellParser.parseCommand(builder.code)
      builder.error = false
    catch err
      builder.error = 'compilation error \n' + err.stack
      builder.result = emptyresult
      #throw err
  $scope
    ..screenHeight = window.screen.availHeight
    ..options = SelectionOptions
    ..isImplemented = isImplemented
    ..builder =
      code: ''
      result: emptyresult
      error: false
  translateX = 0
  translateY = 0
  startX = 0
  startY = 0

##data-flow

app.controller 'data-flow', ($scope) ->
  emptyresult = {
    components:[]
    connections:[]
  }

  $scope.options = SelectionOptions
  connectors = []
  examples =
    * title:"single",
      command: "cat -A"
    * title:"single2",
      command: "ls -IAmACoolGuy"
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
    

  results = []
  for example,index in examples
    results.push {
      id: index
      inputCommand: example.command
      example.title
      example.command
      visualData: emptyresult
      parsed:false
    }

    let indx = index
      $scope.$watch "TransformResults[#indx].visualData", ((newValue)->
        return unless results[indx].parsed
        results[indx].command = shellParser.parseVisualData results[indx].visualData
      ), true

  translateX = 0
  translateY = 0
  startX = 0
  startY = 0

  parseExample = (num) ->
    result = $scope.TransformResults[num]
    return if result.parsed
    AST = shellParser.generateAST result.command
    visualData = shellParser.parseAST AST
    result
      ..visualData = visualData
      ..parsed = true  
  $scope
    ..screenHeight = window.screen.availHeight
    ..TransformResults = results
    ..screenHeight = window.screen.availHeight
    ..tab = results.0.id
    ..updateTab = (id) -> parseExample id; $scope.tab = id
    ..isImplemented = isImplemented
  parseExample 0


