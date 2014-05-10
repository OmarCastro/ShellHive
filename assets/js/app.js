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
var app = angular.module('demo', ['ui.bootstrap', 'ui.layout']);

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
    $scope.$digest();


    console.log(data);
    var graphs = data.graphs
    var len = graphs.length;
    if(len == 0){
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



app.directive("connector", function($document){
  return {
    scope: true,
    link: function(scope, element, attr){
      var StartPortOffset, EndPortOffset;
      
      var dataedge = scope.$parent.edge;
      var elem = element[0];
      var $graphElement = element.closest('[graph-model]');
      var graphElement = $graphElement[0];
      
      
      var startComponent = dataedge.startComponent;
      var startPosition = startComponent.position;
      var endComponent = dataedge.endComponent;
      var endPosition = endComponent.position;
      scope.endsPositions = [startPosition,endPosition]
      
       function update(){
         console.log('updating edge')
          setEdgePath(startPosition.x + StartPortOffset.left, 
                      startPosition.y + StartPortOffset.top,
                      endPosition.x + EndPortOffset.left,
                      endPosition.y + EndPortOffset.top);
      };
      
      
      

      var setEdgePath = function(iniX, iniY, endX, endY){
        var xpoint;
        xpoint = (endX - iniX) / 4;
        elem.setAttribute(
          'd', "M " + iniX + " " + iniY 
            + " H " + (iniX + 0.5 * xpoint) 
            + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
            + " H " + endX);
      };
     
      scope.update = update;
      
      scope.reset = function(){
        var Startnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.startNode + "']");
        var StartPort = Startnode.querySelector(".box[data-port='" + dataedge.startPort + "']");
        var Endnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.endNode + "']");
        var EndPort = Endnode.querySelector(".box[data-port='" + dataedge.endPort + "']");
        StartPortOffset = {
          top: StartPort.offsetTop + StartPort.offsetHeight * 0.75,
          left: StartPort.offsetLeft
        };
        EndPortOffset = {
          top: EndPort.offsetTop + EndPort.offsetHeight * 0.75,
          left: EndPort.offsetLeft
        };
        update();
      };
      requestAnimationFrame(function(){
        scope.$watch('edge.endPort', scope.reset);
        //scope.$watch('endsPositions',scope.update,true)
        requestAnimationFrame(scope.reset)
      });
    }
  };
});

app.directive("component", function($document){
  var pointerId;
  pointerId = 0;
  return {
    require: '^graphModel',
    scope: true,
    link: function(scope, element, attr, graphModelController){
      var datanode, startX, startY, title, position, elem, imstyle, mousemove, moveBy, mouseup;
      datanode = scope.data;
      startX = 0;
      startY = 0;
      title = datanode.title;
      position = datanode.position;
      
      scope.update = function(){
        scope.transform = "translate(" + position.x + "px, " + position.y + "px)"; 
      }
      
      scope.update();
      elem = element[0];
      imstyle = elem.style;
      //scope.$watch('data.position',scope.update, true);
      var drag = false;
      element.bind("pointerdown", function(ev){
        var event, targetTag, pointerId, x$;
        //console.log(datanode);
        switch (ev.which) {
        case 2:
          return true;
        case 3:
          return false;
        }
        graphModelController.hidePopupAndEdge();
        event = ev.originalEvent;
        targetTag = event.target.tagName;
        console.log(targetTag);
        if (pointerId || in$(targetTag, 'INPUT SELECT LABEL BUTTON A TEXTAREA'.split(" "))) {
          return true;
        }
        var drag = false;
        pointerId = event.pointerId;
        x$ = $document;
        x$.bind("pointermove", mousemove);
        x$.bind("pointerup", mouseup);
        startX = event.screenX;
        startY = event.screenY;
        
        
        return false;
      });
      mousemove = function(ev){
        var event;
        event = ev.originalEvent;
        moveBy(event.screenX - startX, event.screenY - startY);
        startX = event.screenX;
        startY = event.screenY;
      };
      moveBy = function(x, y){
        drag = true;
        graphModelController.translateNode(datanode.id, position, x, y);
        printget({type: 'move', componentId:scope.data.id, movepos: position});
        scope.update();
         $('path[connector]').each(function(index){
              var scope = $(this).scope();
              if(scope.endsPositions[0] == position || scope.endsPositions[1] == position){
                scope.update();
              }
            })
        
        //
        //socket.get('/users/3',function serverSays(err,users){
        //    if (err)
        //        console.log(err)
        //    console.log(JSON.stringify(users));
        //});
        
      };
      mouseup = function(ev){
        var pointerId, x$;
        pointerId = 0;
        var doc = $document;
        doc.unbind("pointermove", mousemove);
        doc.unbind("pointerup", mouseup);
        if(drag){
          scope.$emit('updateComponent',datanode);
          drag = false;
          ev.preventDefault();
          return false;
        }
      };
    }
  };
});
app.directive("port", function($document){
  return {
    require: '^graphModel',
    scope: true,
    link: function(scope, element, attr, graphModelController){
      var datanode, title, position, elem, imstyle, ref$, ConnectIfOk, mousemove, mouseup;
      datanode = scope.$parent.data;
      title = datanode.title;
      position = datanode.position;
      elem = element[0];
      imstyle = elem.style;
      scope.componentId = datanode.id;
      scope.isOutputNode = (ref$ = attr.port) === 'output' || ref$ === 'error' || ref$ === 'retcode';
      element.bind("pointerdown", function(ev){
        var event, x$;
        console.log(ev);
        event = ev.originalEvent;
        graphModelController.startEdge(elem, position, event);
        x$ = $document;
        x$.bind("pointermove", mousemove);
        x$.bind("pointerup", mouseup);
        return false;
      });
      ConnectIfOk = function(startNode, startPort, endNode, endPort){
        var visualData, isOk, i$, ref$, len$, x;
        visualData = graphModelController.getVisualData();
        isOk = true;
        for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
          x = ref$[i$];
          if ((x.startNode === endNode && x.endNode === startNode) || (x.startNode === startNode && x.endNode === endNode)) {
            isOk = false;
            break;
          }
        }
        if (isOk) {
          visualData.connections.push({
            startNode: startNode,
            startPort: startPort,
            endNode: endNode,
            endPort: endPort
          });
          graphModelController.updateScope();
        }
      };
      mousemove = function(ev){
        graphModelController.moveEdge(ev.originalEvent);
      };
      mouseup = function(ev){
        var event, pointedElem, $pointedElem, ref$, outAttr, outPortScope, x$;
        event = ev.originalEvent;
        pointedElem = document.elementFromPoint(event.clientX, event.clientY);
        $pointedElem = $(pointedElem);
        if (graphModelController.isFreeSpace(pointedElem)) {
          if ((ref$ = attr.port) === 'output' || ref$ === 'error' || ref$ === 'retcode') {
            graphModelController.showPopup(event, scope.componentId, attr.port, null, 'input');
          } else {
            graphModelController.showPopup(event, null, 'output', scope.componentId, attr.port);
          }
        } else {
          graphModelController.endEdge();
          outAttr = $pointedElem.attr("data-port");
          if (outAttr) {
            outPortScope = $pointedElem.scope();
            if (scope.isOutputNode !== outPortScope.isOutputNode) {
              if (scope.isOutputNode) {
                ConnectIfOk(scope.componentId, attr.port, outPortScope.componentId, outAttr);
              } else {
                ConnectIfOk(outPortScope.componentId, outAttr, scope.componentId, attr.port);
              }
            }
          }
        }
        $document.unbind("pointermove", mousemove);
        $document.unbind("pointerup", mouseup);
      };
    }
  };
});
