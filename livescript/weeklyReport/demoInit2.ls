app = angular.module('demo', ['ui.bootstrap','ui.layout']);

app.controller 'data-flow', ['$scope',($scope) ->
    console.log shellParser
    AST = shellParser.generateAST """ diff <(zcat rev6/data.txt.gz) <(zcat rev18/data.txt.gz) """
    visualData = shellParser.parseAST AST

    $scope.isImplemented = isImplemented
    $scope.options = SelectionOptions
    $scope.res = {
      visualData: visualData
    }
    #$scope.$watch "result.visualData.components", ((newValue)->
    #  results[indx].command = shellParser.parseVisualData results[indx].visualData
    #), true

    $scope.shellText = []

    $scope.runCommand = (command) ->
       console.log $scope.res.visualData
       command = shellParser.parseVisualData $scope.res.visualData
       $scope.shellText.push {text:command, type: "call"}
       $scope.shellText.push {text:"this is a demo", type: "error"}
       $scope.shellText = $scope.shellText[-50 to] if $scope.shellText.length > 50



    $scope.$on "runCommand", (event, message) ->
      console.log \runCommand!
      $scope.runCommand!

    #$scope.runCommand("ls -l | sort")
]