
var viewGraph;

app.controller('shellProject', ['$scope', function($scope){
  var AST, visualData;
  visualData = {};
  $scope.graphData = visualData;
  $scope.implementedCommands = [];
  $scope.isImplemented = function(data){
    return this.implementedCommands.indexOf(data.exec) >= 0;
  };

  viewGraph = $scope.viewGraph = function viewGraph(graph){
    if(graph.id){graph = graph.id}
    io.socket.get('/graph/subscribe/', {id:graph}, function(res){
      console.log(res);
      $scope.graphData.components = res.graph.components.map(function(component){
        component.data.id = component.id;
        res.graph.connections.forEach(function(connection){
          if(connection.startNode == component.id) connection.startComponent = component.data
          if(connection.endNode == component.id) connection.endComponent = component.data
        })
        return component.data
      }); 
      $scope.graphData.connections = res.graph.connections; 
      $scope.$digest();
    });
  }


  // Subscribe to the user model classroom and instance room
  socket.get('/project/subscribe', {id:projId}, function(data){
    $scope.implementedCommands = data.implementedCommands
    $scope.options             = data.SelectionOptions;
    $scope.page = "graph";

    $scope.$digest();


    console.log(data);
    var graphs = data.graphs
    var len = graphs.length;
    if(len == 0){
      $scope.page = "newProject";
      $scope.$digest();      
      // is a new project
    } else {        
      var macros = visualData.macros = [];
      var macroList = visualData.macroList = [];
      for(var i = 0; i < len; ++i){
        var graph = graphs[i];
        if(graph.isRoot){
          $scope.rootGraph = graphs[i]
          viewGraph(graphs[i].id)
        } else {
          macros[graph.name] = graphs[i]
          macroList.push(graph.name)
        }
      }
    }
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


  var actionReceiveCallbacks = {
    move: function(data){
      onComponentbyID_do(data.componentId, function(component){
        var position = component.position;
        position.x = data.movepos.x;
        position.y = data.movepos.y;

        var compScope = $('.component[data-node-id="'+ data.componentId +'"]').scope();
        if(compScope.data == component){
          compScope.update(); 
          compScope.$digest();
        }

        $('path[connector]').each(function(index){
          var scope = $(this).scope();
          if(scope.endsPositions[0] == position || scope.endsPositions[1] == position){
            scope.update();
          }
        })
      })
    },
    removeComponent: function(data){
      var components = data.components.map(function(component){return component.id})
      var connections = data.connections.map(function(connection){return connection.id})
      visualData.components = visualData.components.filter(function(component){return components.indexOf(component.id) < 0})
      visualData.connections = visualData.connections.filter(function(connection){return connections.indexOf(connection.id) < 0})   
      $scope.$digest();
    },

    addComponent: function(data){
      data.component.data.id = data.component.id
      visualData.components.push(data.component.data)
      if(data.connection){
        var connection = data.connection;
        connection.startComponent = visualData.components.filter(function(component){return component.id == connection.startNode})[0]
        connection.endComponent = data.component.data
        visualData.connections.push(connection)
      }
      $scope.$digest();
    },

  }


  io.socket.on('action', function(data){
    console.log('action',data);
    actionReceiveCallbacks[data.type](data)
  });

  $scope.$on("runCommand", function(event, message){
    console.log('runCommand!');
    return $scope.runCommand();
  });
  $scope.$on("removeComponent", function(event, message){
    console.log('removeComponent '+message+' !');
    io.socket.post('/graph/removeComponent/', {id:message, _csrf:_csrf}, function(data){
      console.log(data);
    });
  });

  $scope.$on("addAndConnectComponent", function(event, message){
    console.log('addAndConnectComponent ', message,' !');
    message._csrf = _csrf
    io.socket.post('/graph/createAndConnectComponent/', message, function(data){
      console.log(data);
    });
  });

    $scope.$on("addComponent", function(event, message){
    console.log('addComponent ', message,' !');
    message._csrf = _csrf
    io.socket.post('/graph/createComponent/', message, function(data){
      console.log(data);
    });
  });
  
  $scope.$on("updateComponent", function(event, message){
    console.log('updateComponent:' , message);
    message._csrf = _csrf
    var dataid = message.id;
    io.socket.put('/component/'+dataid, message, function(data){
      console.log(data);
    });
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

