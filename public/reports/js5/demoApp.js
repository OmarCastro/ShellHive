/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
var cssTransform, listOfImplementedCommands, SelectionOptions;
function getCSSSupportedProp(proparray){
  var root, i$, len$, i;
  root = document.documentElement;
  for (i$ = 0, len$ = proparray.length; i$ < len$; ++i$) {
    i = proparray[i$];
    if (i in root.style) {
      return i;
    }
  }
}
cssTransform = getCSSSupportedProp(['transform', 'WebkitTransform', 'MsTransform']);
listOfImplementedCommands = ['awk', 'cat', 'grep', 'bunzip2', 'bzcat', 'bzip2', 'compress', 'ls', 'gzip', 'gunzip', 'zcat'];
function isImplemented(data){
  return listOfImplementedCommands.indexOf(data.exec >= 0);
}
function closestParentWithClass(element, classStr){
  var parent;
  parent = element.parentElement;
  while (parent !== document.body) {
    if (angular.element(parent).hasClass(classStr)) {
      return parent;
    } else {
      parent = parent.parentElement;
    }
  }
  return null;
}
SelectionOptions = shellParser.VisualSelectorOptions;
var app, socket, slice$ = [].slice;
app = angular.module('demo', ['ui.bootstrap']);
socket = io.connect();
app.controller('data-flow', [
  '$scope', function($scope){
    var AST, visualData;
    console.log(shellParser);
    AST = shellParser.generateAST(" ls -lr | grep e ");
    visualData = shellParser.parseAST(AST);
    $scope.isImplemented = isImplemented;
    $scope.options = SelectionOptions;
    $scope.res = {
      visualData: visualData
    };
    $scope.shellText = [];
    $scope.runCommand = function(command){
      return socket.emit('runCommand', {
        visualData: $scope.res.visualData
      });
    };
    socket.on('commandCall', function(data){
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
    socket.on('stdout', function(data){
      var x;
      $scope.shellText = $scope.shellText.concat((function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
          x = ref$[i$];
          results$.push({
            text: x,
            type: "info"
          });
        }
        return results$;
      }()));
      if ($scope.shellText.length > 50) {
        $scope.shellText = slice$.call($scope.shellText, -50);
      }
      return $scope.$digest();
    });
    socket.on('stderr', function(data){
      var x;
      $scope.shellText = $scope.shellText.concat((function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = data.split("\n")).length; i$ < len$; ++i$) {
          x = ref$[i$];
          results$.push({
            text: x,
            type: "error"
          });
        }
        return results$;
      }()));
      if ($scope.shellText.length > 50) {
        $scope.shellText = slice$.call($scope.shellText, -50);
      }
      return $scope.$digest();
    });
    return $scope.$on("runCommand", function(event, message){
      console.log('runCommand!');
      return $scope.runCommand();
    });
  }
]);
app.directive("connector", function($document){
  return {
    scope: true,
    link: function(scope, element, attr){
      var StartPortOffset, EndPortOffset, startPosition, endPosition, startComponent, endComponent, dataedge, elem, $graphElement, resultScope, graphElement, i$, ref$, len$, component, setEdgePath, update;
      dataedge = scope.$parent.edge;
      elem = element[0];
      $graphElement = element.closest('[graph-model]');
      resultScope = $graphElement.scope();
      graphElement = $graphElement[0];
      for (i$ = 0, len$ = (ref$ = resultScope.visualData.components).length; i$ < len$; ++i$) {
        component = ref$[i$];
        if (component.id === dataedge.startNode) {
          startComponent = component;
          startPosition = component.position;
          break;
        }
      }
      for (i$ = 0, len$ = (ref$ = resultScope.visualData.components).length; i$ < len$; ++i$) {
        component = ref$[i$];
        if (component.id === dataedge.endNode) {
          endComponent = component;
          endPosition = component.position;
          break;
        }
      }
      setEdgePath = function(iniX, iniY, endX, endY){
        var xpoint;
        xpoint = (endX - iniX) / 4;
        return elem.setAttribute('d', "M " + iniX + " " + iniY + " H " + (iniX + 0.5 * xpoint) + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY + " H " + endX);
      };
      update = function(){
        return setEdgePath(startPosition.x + StartPortOffset.left, startPosition.y + StartPortOffset.top, endPosition.x + EndPortOffset.left, endPosition.y + EndPortOffset.top);
      };
      scope.update = update;
      scope.updateWithId = function(id){
        if (dataedge.startNode === id || dataedge.endNode === id) {
          update();
        }
      };
      scope.reset = function(){
        var Startnode, StartPort, Endnode, EndPort;
        Startnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.startNode + "']");
        StartPort = Startnode.querySelector(".box[data-port='" + dataedge.startPort + "']");
        Endnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.endNode + "']");
        EndPort = Endnode.querySelector(".box[data-port='" + dataedge.endPort + "']");
        StartPortOffset = {
          top: StartPort.offsetTop + StartPort.offsetHeight * 0.75,
          left: StartPort.offsetLeft
        };
        EndPortOffset = {
          top: EndPort.offsetTop + EndPort.offsetHeight * 0.75,
          left: EndPort.offsetLeft
        };
        return update();
      };
      requestAnimationFrame(function(){
        scope.$watch('edge.endPort', function(){
          return scope.reset();
        });
        return scope.reset();
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
      scope.transform = cssTransform.replace(/[A-Z]/g, function(v){
        return "-" + v.toLowerCase();
      });
      datanode = scope.$parent.data;
      startX = 0;
      startY = 0;
      title = datanode.title;
      position = datanode.position;
      elem = element[0];
      imstyle = elem.style;
      element.bind("pointerdown", function(ev){
        var event, targetTag, pointerId, x$;
        console.log(datanode);
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
        if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL' || targetTag === 'BUTTON' || targetTag === 'A')) {
          return true;
        }
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
        graphModelController.translateNode(datanode.id, position, x, y);
        scope.$digest();
      };
      mouseup = function(){
        var pointerId, x$;
        pointerId = 0;
        x$ = $document;
        x$.unbind("pointermove", mousemove);
        x$.unbind("pointerup", mouseup);
        return x$;
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
        x$ = $document;
        x$.unbind("pointermove", mousemove);
        x$.unbind("pointerup", mouseup);
      };
    }
  };
});
app.directive("graphModel", function($document){
  return {
    replace: false,
    scope: {
      graphModel: '=',
      options: '='
    },
    controller: [
      '$scope', '$element', '$modal', '$attrs', function(scope, element, $modal, attr){
        var pointerId, scale, graphX, graphY, startX, startY, edgeIniX, edgeIniY, elem, nodesElem, nodesElemStyle, edgesElem, edgesElemStyle, svgElem, $svgElem, workspace, $workspace, popup, $popup, popupHeight, $popupInput, graphModel, res$, key, ref$, val, x$, update, mousemove, mouseup, newComponent, newMacroComponent, newCommandComponent, mapMouseToScene, mapMouseToView, mapPointToScene, scaleFromMouse, MouseWheelHandler, mousewheelevt, simpleEdge, setEdgePath, popupState, startEdge, moveEdge, endEdge, showPopup, popupSubmit, hidePopup, hidePopupAndEdge, y$;
        pointerId = 0;
        scale = 1;
        graphX = 0;
        graphY = 0;
        startX = 0;
        startY = 0;
        edgeIniX = 0;
        edgeIniY = 0;
        elem = element[0];
        nodesElem = elem.querySelector(".nodes");
        nodesElemStyle = nodesElem.style;
        edgesElem = elem.querySelector(".edges");
        edgesElemStyle = edgesElem.style;
        svgElem = elem.querySelector("svg");
        $svgElem = $(svgElem);
        workspace = elem.querySelector(".workspace");
        $workspace = $(workspace);
        popup = elem.querySelector(".popup");
        $popup = $(popup);
        popupHeight = $popup.find("form").height();
        $popup.hide();
        $popupInput = $popup.find("input");
        graphModel = scope.graphModel;
        graphModel.macros = {
          sss: shellParser.createMacro('sss', 'ddd')
        };
        res$ = [];
        for (key in ref$ = graphModel.macros) {
          val = ref$[key];
          res$.push(key);
        }
        graphModel.macroList = res$;
        x$ = scope;
        x$.popupText = '';
        x$.graph = this;
        x$.$watch("graphModel", function(){
          return scope.visualData = scope.graphModel;
        });
        x$.visualData = scope.graphModel;
        x$.implementedCommands = listOfImplementedCommands;
        x$.isImplemented = isImplemented;
        x$.isArray = angular.isArray;
        x$.isString = angular.isString;
        x$.swapPrevious = function(array, index, id){
          var ref$, i$, len$, connection, results$ = [];
          if (index === 0) {
            return;
          }
          ref$ = [array[index - 1], array[index]], array[index] = ref$[0], array[index - 1] = ref$[1];
          for (i$ = 0, len$ = (ref$ = scope.visualData.connections).length; i$ < len$; ++i$) {
            connection = ref$[i$];
            if (connection.endNode === id) {
              if (connection.endPort === "file" + index) {
                results$.push(connection.endPort = "file" + (index - 1));
              } else if (connection.endPort === "file" + (index - 1)) {
                results$.push(connection.endPort = "file" + index);
              }
            }
          }
          return results$;
        };
        update = function(){
          var transform;
          transform = "translate(" + graphX + "px, " + graphY + "px) scale(" + scale + ")";
          nodesElemStyle[cssTransform] = transform;
          return edgesElemStyle[cssTransform] = transform;
        };
        update();
        mousemove = function(ev){
          var event;
          event = ev.originalEvent;
          graphX += event.screenX - startX;
          graphY += event.screenY - startY;
          startX = event.screenX;
          startY = event.screenY;
          update();
        };
        mouseup = function(){
          var x$;
          pointerId = 0;
          x$ = $document;
          x$.unbind("pointermove", mousemove);
          x$.unbind("pointerup", mouseup);
          return x$;
        };
        element.bind("pointerdown", function(ev){
          var event, targetTag, x$;
          if (ev.which === 3) {
            return false;
          }
          event = ev.originalEvent;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL' || targetTag === 'A' || targetTag === 'LI' || targetTag === 'BUTTON')) {
            return;
          }
          hidePopupAndEdge();
          pointerId = event.pointerId;
          x$ = $document;
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });
        newComponent = function(content, position){
          if (in$(content.split(" ")[0], listOfImplementedCommands)) {
            return newCommandComponent(content, position);
          } else {
            return newMacroComponent(content, position);
          }
        };
        newMacroComponent = function(name, position){
          var visualData, newComponent;
          visualData = scope.visualData;
          newComponent = {
            type: 'subgraph',
            macro: graphModel.macros[name],
            id: visualData.counter++,
            position: {}
          };
          visualData.components.push(newComponent);
          importAll$(newComponent.position, position);
          return newComponent;
        };
        newCommandComponent = function(command, position){
          var visualData, newResult, x$, newComponent;
          visualData = scope.visualData;
          newResult = shellParser.parseCommand(command);
          x$ = newComponent = newResult.components[0];
          x$.id = visualData.counter++;
          importAll$(x$.position, position);
          visualData.components.push(newComponent);
          return newComponent;
        };
        mapMouseToScene = function(event){
          var ref$, x, y;
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          return mapPointToScene(x, y);
        };
        mapMouseToView = function(event){
          var offset;
          offset = $workspace.offset();
          return {
            x: Math.round(event.pageX - offset.left),
            y: Math.round(event.pageY - offset.top)
          };
        };
        mapPointToScene = function(x, y){
          return {
            x: (x - graphX) / scale,
            y: (y - graphY) / scale
          };
        };
        scaleFromMouse = function(amount, event){
          var ref$, x, y, relpointX, relpointY;
          if ((scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)) {
            return;
          }
          hidePopupAndEdge();
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          relpointX = x - graphX;
          relpointY = y - graphY;
          graphX += Math.round(-relpointX * amount + relpointX);
          graphY += Math.round(-relpointY * amount + relpointY);
          scale *= amount;
          update();
        };
        MouseWheelHandler = function(event){
          if (!event.altKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if ((event.wheelDelta || -event.detail) > 0) {
            return scaleFromMouse(1.1, event);
          } else {
            return scaleFromMouse(0.9, event);
          }
        };
        mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
        simpleEdge = element.find('.emptyEdge')[0];
        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return simpleEdge.setAttribute('d', "M " + iniX + " " + iniY + " \nH " + (iniX + 0.5 * xpoint) + " \nC " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY + " \nH " + endX);
        };
        popupState = {
          x: 0,
          y: 0,
          startNode: 0,
          startPort: 0
        };
        startEdge = function(elem, position, ev){
          this.hidePopup();
          edgeIniX = elem.offsetLeft + position.x;
          edgeIniY = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
          return setEdgePath(edgeIniX, edgeIniY, edgeIniX, edgeIniY);
        };
        moveEdge = function(event){
          var ref$, x, y;
          ref$ = mapMouseToScene(event), x = ref$.x, y = ref$.y;
          return setEdgePath(edgeIniX, edgeIniY, x, y);
        };
        endEdge = function(){
          return simpleEdge.setAttribute('d', "M 0 0");
        };
        showPopup = function(event, startNode, startPort, endNode, endPort){
          var ref$, x, y, x$;
          scope.popupText = '';
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          importAll$(popupState, {
            x: x,
            y: y
          });
          x$ = popupState;
          x$.startNode = startNode;
          x$.startPort = startPort;
          x$.endNode = endNode;
          x$.endPort = endPort;
          popup.style[cssTransform] = "translate(" + Math.round(x) + "px," + Math.round(y - popupHeight / 2) + "px)";
          $popup.show();
          $popupInput.focus();
          return scope.$digest();
        };
        popupSubmit = function(content){
          var comp;
          comp = newComponent(content, popupState);
          popupState.startNode == null && (popupState.startNode = comp.id);
          popupState.endNode == null && (popupState.endNode = comp.id);
          scope.visualData.connections.push({
            startNode: popupState.startNode,
            startPort: popupState.startPort,
            endNode: popupState.endNode,
            endPort: popupState.endPort
          });
          hidePopup();
          return endEdge();
        };
        hidePopup = function(){
          return $popup.hide();
        };
        hidePopupAndEdge = function(){
          $popup.hide();
          return endEdge();
        };
        scope.newMacroModal = function(){
          var form, modalInstance;
          form = {
            name: '',
            description: ''
          };
          modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: function($scope, $modalInstance){
              $scope.form = form;
              $scope.cancel = function(){
                return $modalInstance.dismiss('cancel');
              };
              $scope.ok = function(){
                $modalInstance.close(form);
              };
            }
          });
          return modalInstance.result.then(function(selectedItem){
            scope.graph.newMacro(form.name, form.description);
            return form.name = form.description = '';
          });
        };
        scope.newCommandAtTopLeft = function(command){
          return newCommandComponent(command, mapPointToScene(0, 0));
        };
        y$ = this;
        y$.removeComponent = function(id){
          var x$, res$, i$, ref$, len$, x;
          console.log("removing component");
          x$ = scope.visualData;
          res$ = [];
          for (i$ = 0, len$ = (ref$ = scope.visualData.components).length; i$ < len$; ++i$) {
            x = ref$[i$];
            if (x.id !== id) {
              res$.push(x);
            }
          }
          x$.components = res$;
          res$ = [];
          for (i$ = 0, len$ = (ref$ = scope.visualData.connections).length; i$ < len$; ++i$) {
            x = ref$[i$];
            if (x.startNode !== id && x.endNode !== id) {
              res$.push(x);
            }
          }
          x$.connections = res$;
        };
        y$.isFreeSpace = function(elem){
          return elem === svgElem || elem === workspace || elem === nodesElem;
        };
        y$.showPopup = showPopup;
        y$.nodesElement = nodesElem;
        y$.popupSubmit = popupSubmit;
        y$.hidePopup = hidePopup;
        y$.hidePopupAndEdge = hidePopupAndEdge;
        y$.nodesElement = nodesElem;
        y$.newCommandComponent = newCommandComponent;
        y$.newMacroComponent = newMacroComponent;
        y$.startEdge = startEdge;
        y$.moveEdge = moveEdge;
        y$.endEdge = endEdge;
        y$.isMacroView;
        y$.updateScope = function(){
          return scope.$digest();
        };
        y$.getVisualData = function(){
          return scope.visualData;
        };
        y$.mapPointToScene = mapPointToScene;
        y$.mapMouseToScene = mapMouseToScene;
        y$.mapMouseToView = mapMouseToView;
        y$.setGraphView = function(view){
          hidePopupAndEdge();
          scope.visualData = view;
          scope.$digest();
        };
        y$.revertToRoot = function(){
          scope.visualData = graphModel;
        };
        y$.newMacro = function(name, descr){
          var res$, key;
          graphModel.macros[name] = shellParser.createMacro(name, descr);
          res$ = [];
          for (key in graphModel.macros) {
            res$.push(key);
          }
          graphModel.macroList = res$;
        };
        y$.translateNode = function(id, position, x, y){
          var i$, ref$, len$, el;
          position.x += x / scale;
          position.y += y / scale;
          for (i$ = 0, len$ = (ref$ = edgesElem.querySelectorAll("[connector]")).length; i$ < len$; ++i$) {
            el = ref$[i$];
            $(el).scope().updateWithId(id);
          }
        };
      }
    ]
  };
});
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
/*
##sidebar

app.directive 'sidebar', ['$document', ($document) ->
  replace: false
  scope: true
  require: '^graphModel'
  controller: ($scope, $element, $modal, $attrs) ->
    form =
      name:''
      description:''    
    console.log $scope.graph
    $scope.implementedCommands = shellParser.implementedCommands
    $scope.open = -> 
      modalInstance = $modal.open {
        templateUrl: 'myModalContent.html'
        controller: ($scope, $modalInstance) !->
          ctrl = this
          $scope.form = form
          $scope.cancel = -> $modalInstance.dismiss('cancel');
          $scope.ok = !-> $modalInstance.close(form);
        resolve:
          items: -> $scope.items
      }

      modalInstance.result.then (selectedItem) ->
        $scope.graph.newMacro form.name, form.description
        form.name = form.description = ''

  link:(scope, element, attr,graphModelCtrl) !->
    requestAnimationFrame ->
      element.find('a[data-command]').each (index) ->
        $ this .bind 'click', (ev)->
          console.log ev
          graphModelCtrl.newCommandComponent do
            $(this).attr(\data-command)
            graphModelCtrl.mapPointToScene 0,0
          graphModelCtrl.updateScope!


  templateUrl: 'sidebarModel.html'

]


app.directive 'sidebarMacroComponent',  ->
  replace: true
  require: '^graphModel'
  scope:
      sidebarMacroComponent: '='
  link: (scope, element, attrs, graphModelCtrl) !->
      scope.selectItem = !->
        name = scope.sidebarMacroComponent
        graphModelCtrl.newMacroComponent graphModelCtrl.mapPointToScene 0,0
        #console.log graphModelCtrl.getVisualData!.macros[name]
  template: """
      <li>
          <a ng-click='selectItem()'>
              {{sidebarMacroComponent}}
          </a>
      </li>"""
# */
var activeDrop;
activeDrop = null;
app.directive('dropdownSelect', [
  '$document', function($document){
    return {
      restrict: 'A',
      replace: true,
      scope: {
        dropdownSelect: '=',
        dropdownModel: '=',
        dropdownOnchange: '&'
      },
      controller: [
        '$scope', '$element', '$attrs', function($scope, $element, $attrs){
          var body;
          this.select = function(selected){
            $scope.dropdownModel = selected;
            $scope.dropdownOnchange({
              selected: selected
            });
          };
          body = $document.find("body");
          body.bind("click", function(){
            $element.removeClass('active');
            activeDrop = null;
          });
          $element.bind('click', function(event){
            event.stopPropagation();
            if (activeDrop && activeDrop !== $element) {
              activeDrop.removeClass('active');
              activeDrop = null;
            }
            $element.toggleClass('active');
            activeDrop = $element;
          });
        }
      ],
      template: "<div class='wrap-dd-select'>\n    <span class='selected'>{{dropdownModel}}</span>\n    <ul class='dropdown'>\n        <li ng-repeat='item in dropdownSelect'\n            class='dropdown-item'\n            dropdown-select-item='item'>\n        </li>\n    </ul>\n</div>"
    };
  }
]);
app.directive('dropdownSelectItem', [function(){
  return {
    require: '^dropdownSelect',
    replace: true,
    scope: {
      dropdownSelectItem: '='
    },
    link: function(scope, element, attrs, dropdownSelectCtrl){
      scope.selectItem = function(){
        dropdownSelectCtrl.select(scope.dropdownSelectItem);
      };
    },
    template: "<li>\n    <a href='' class='dropdown-item'\n        ng-click='selectItem()'>\n        {{dropdownSelectItem}}\n    </a>\n</li>"
  };
}]);