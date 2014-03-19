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
  
  examples = dataFlowExamples;
    

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


