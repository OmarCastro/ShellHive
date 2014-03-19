app = angular.module('demo', ['ui.bootstrap']);

socket = io.connect!


app.controller 'data-flow', ['$scope',($scope) ->
    console.log shellParser
    AST = shellParser.generateAST """ ls -lr | grep e """
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
       #$scope.shellText ++= [{text:"$ #command", type: "call"}]
       socket.emit('runCommand', {visualData: $scope.res.visualData})

    socket.on 'commandCall', (data) ->
        $scope.shellText ++= [{text:x, type: "call"} for x in data.split("\n")]
        $scope.$digest!
    socket.on 'stdout', (data) ->
        $scope.shellText ++= [{text:x, type: "info"} for x in data.split("\n")]
        $scope.shellText = $scope.shellText[-50 to] if $scope.shellText.length > 50
        $scope.$digest!

    socket.on 'stderr', (data) ->
        $scope.shellText ++= [{text:x, type: "error"} for x in data.split("\n")]
        $scope.shellText = $scope.shellText[-50 to] if $scope.shellText.length > 50
        $scope.$digest!


    $scope.$on "runCommand", (event, message) ->
      console.log \runCommand!
      $scope.runCommand!

    #$scope.runCommand("ls -l | sort")
]