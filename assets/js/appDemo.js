/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/

function getCSSSupportedProp(proparray){
  var root = document.documentElement;
  for (var i = 0, len = proparray.length; i < len; ++i) {
    if (proparray[i] in root.style) {
      return proparray[i];
    }
  }
}

var cssTransform = getCSSSupportedProp(['transform', 'WebkitTransform', 'MsTransform']);

//var SelectionOptions = shell_Parser.VisualSelectorOptions;
var app = angular.module('app', ['ui.bootstrap', 'ui.layout']);

var socket = io.socket;
var pathArray = window.location.pathname.split( '/' );
var projId = pathArray[pathArray.length - 1];
window.projId = projId;

socket.on('mess', function(data){ console.log('mess', data) });
socket.on('message', function(data){ console.log('message', data) });

  socket.on('connect', function socketConnected() {

    console.log("This is from the connect: ", this.socket.sessionid);
   
    var _csrf = null;
    
    socket.get('/csrfToken', {id:projId}, function(data){
      _csrf = data._csrf;
      window._csrf = _csrf
    });
    
    window.printget = function(reqdata){
      console.log('posting movement', reqdata);
      io.socket.post('/project/graphaction', {id:projId, message:reqdata,_csrf:_csrf}, function(data){
        console.log(data);
      });
    }

    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to 
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    console.log(
        'Socket is now connected and globally accessible as `socket`.\n' + 
        'e.g. to send a GET request to Sails, try \n' + 
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////

  });


var viewGraph;

app.controller('data-flow', ['$scope', function($scope){
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
    graphData.components = graphData.components.filter(function(component){component.id == id})
    graphData.connections = graphData.connections.filter(function(connection){
          return (connection.startNode !== component.id && connection.endNode !== component.id)
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

