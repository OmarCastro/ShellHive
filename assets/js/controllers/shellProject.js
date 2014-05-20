
var viewGraph;

app.controller('shellProject', ['$scope', 'alerts', function($scope, alerts){
  var AST, visualData;
  visualData = {};
  $scope.alerts = alerts
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
      console.log("addComponent:", data);
      if(data.component){
        data.component.data.id = data.component.id
        visualData.components.push(data.component.data);
      }
      if(data.connection){
        var connection = data.connection;
        visualData.components.forEach(function(component){
          if(component.id == connection.startNode){
            connection.startComponent = component
          } else if(component.id == connection.endNode){
            connection.endComponent = component
          }
        });
        visualData.connections.push(connection)
      }
      $scope.$digest();
    },

    updateComponent: function(data){
      console.log("updateComponent:", data);
      var components = visualData.components;
      for (var i = components.length - 1; i >= 0; i--) {
        if(components[i].id == data.id){
          var component = components[i];
          for(j in data.data){
            if(j == "position"){
              var comPosition = component.position
              var dataPosition = data.data.position
              comPosition.x = dataPosition.x
              comPosition.y = dataPosition.y
            } else {
              component[j] = data.data[j];
            }
          }
          break;
        }
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
    io.socket.get('/graph/runGraph/',{_csrf:_csrf}, function(data){
      console.log(data);
      $scope.shellText = [{
        text: data.command,
        type: "call"
      }];
      $scope.$digest();
    });
  });

  $scope.$on("compileGraph", function(event){
    console.log('compileGraph!');
    io.socket.get('/graph/compile/',{_csrf:_csrf}, function(data){
      console.log(data);
      $scope.shellText = [{
        text: data.command,
        type: "call"
      }];
      $scope.$digest();
    });
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

  $scope.$on("connectComponent", function(event, message){
    console.log('connectComponent:' , message);
    message = {
      data: message,
      _csrf: _csrf
    }
    io.socket.put('/graph/connect/', message, function(data){
      console.log(data);
      if(data.alert){
        alerts.addAlert({type:'danger', msg: data.message});
        $scope.$digest();
      }
    });
  });

  io.socket.on('commandCall', function(data){
    var x;
    $scope.shellText = $scope.shellText.concat((function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
        x = ref$[i$];
        results$.push({
          text: x,
          type: "call"
        });
      }
      return results$;
    }()));
    return $scope.$digest();
  });



  io.socket.on('stdout', function(data){
    $scope.shellText = $scope.shellText.concat(data.split("\n").map(function(record){
      return {text: record, type: "info"}
    }));
    if ($scope.shellText.length > 100) {
      $scope.shellText = slice$.call($scope.shellText, -100);
    }
    $scope.$digest();
  });
  io.socket.on('stderr', function(data){
    $scope.shellText = $scope.shellText.concat(data.split("\n").map(function(record){
      return {text: record, type: "error"}
    }));
    if ($scope.shellText.length > 100) {
      $scope.shellText = slice$.call($scope.shellText, -100);
    }
    $scope.$digest();
  });
  io.socket.on('retcode', function(data){
    $scope.shellText.push({
      text: "command finished with code "+x,
      type: "call"
    });
    $scope.$digest();
  });
}]);

