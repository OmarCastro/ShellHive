var viewGraph;

app.controller('shellProject', ['$scope', function($scope){
  var AST, visualData;
  visualData = {};
  $scope.graphData = visualData;
  $scope.implementedCommands = [];
  $scope.page = "graph";
  $scope.isImplemented = function(data){
    return this.implementedCommands.indexOf(data.exec) >= 0;
  };

  viewGraph = $scope.viewGraph = function viewGraph(graph){
    $scope.page = "graph";
    var graphData = $scope.graphData
    if(graph){
      graphData.components = graph.components
      graphData.connections = graph.connections
    } else {
      graphData.components = [];
      graphData.connections = [];
    }
    $scope.$digest();
  }


  // Subscribe to the user model classroom and instance room
  socket.get('/demo/subscribe', function(data){
    $scope.implementedCommands = data.implementedCommands
    $scope.options             = data.SelectionOptions;
    viewGraph();
    $scope.page = "newProject";
    $scope.$digest();

    // is a new project

  });

  $scope.shellText = [];
  $scope.runCommand = function(command){
    //console.log($scope.res.visualData);
    //console.log(shell_Parser.parseVisualData($scope.res.visualData));
    //return socket.emit('runCommand', {
    //  visualData: $scope.res.visualData
    //});
  };

  var onComponentbyID_do = function(id, callback){
    var components = visualData.components;
    var component;
    for(var indx = components.length - 1; indx >= 0; indx-- ){
      component = components[indx];
      if(component.id === id){
        callback(component);
        break;
      }
    }
  }

  $scope.$on("runCommand", function(event, message){
    console.log('runCommand!');
    return $scope.runCommand();
  });
  $scope.$on("removeComponent", function(event, id){
    console.log('removeComponent '+id+' !');
    var graphData = $scope.graphData
    graphData.components = graphData.components.filter(function(component){
      return component.id !== id
    })
    graphData.connections = graphData.connections.filter(function(connection){
          return (connection.startNode !== id && connection.endNode !== id)
    })
    $scope.$digest();

    //io.socket.post('/graph/removeComponent/', {id:message, _csrf:_csrf}, function(data){
    //  console.log(data);
    //});
  });

  $scope.$on("addAndConnectComponent", function(event, message){
    console.log('addAndConnectComponent ', message,' !');
    message._csrf = _csrf
    //io.socket.post('/graph/createAndConnectComponent/', message, function(data){
    //  console.log(data);
    //});
  });

  $scope.$on("startProject", function(event, message){
    console.log('startProject ', message,' !');
    message._csrf = _csrf
    io.socket.post('/demo/startproject/', message, function(data){
      console.log(data);

      data.graph.components.forEach(function(component){
        data.graph.connections.forEach(function(connection){
          if(connection.startNode == component.id) connection.startComponent = component
          if(connection.endNode == component.id) connection.endComponent = component
        })
      })

      viewGraph(data.graph);

    });
  });
  
  $scope.$on("updateComponent", function(event, message){
    console.log('updateComponent:' , message);
    message._csrf = _csrf
    var dataid = message.id;
    //io.socket.put('/component/'+dataid, message, function(data){
    //  console.log(data);
    //});
  });



  //socket.on('commandCall', function(data){
  //  var x;
  //  $scope.shellText = $scope.shellText.concat((function(){
  //    var i$, ref$, len$, results$ = [];
  //    for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
  //      x = ref$[i$];
  //      results$.push({
  //        text: x,
  //        type: "call"
  //      });
  //    }
  //    return results$;
  //  }()));
  //  return $scope.$digest();
  //});
  //socket.on('stdout', function(data){
  //  var x;
  //  $scope.shellText = $scope.shellText.concat((function(){
  //    var i$, ref$, len$, results$ = [];
  //    for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
  //      x = ref$[i$];
  //      results$.push({
  //        text: x,
  //        type: "info"
  //      });
  //    }
  //    return results$;
  //  }()));
  //  if ($scope.shellText.length > 50) {
  //    $scope.shellText = slice$.call($scope.shellText, -50);
  //  }
  //  return $scope.$digest();
  //});
  //socket.on('stderr', function(data){
  //  var x;
  //  $scope.shellText = $scope.shellText.concat((function(){
  //    var i$, ref$, len$, results$ = [];
  //    for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
  //      x = ref$[i$];
  //      results$.push({
  //        text: x,
  //        type: "error"
  //      });
  //    }
  //    return results$;
  //  }()));
  //  if ($scope.shellText.length > 50) {
  //    $scope.shellText = slice$.call($scope.shellText, -50);
  //  }
  //  return $scope.$digest();
  //});
}]);

