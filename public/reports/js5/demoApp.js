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
listOfImplementedCommands = ['awk', 'cat', 'grep', 'bunzip2', 'bzcat', 'bzip2', 'compress', 'ls', 'head', 'tail', 'gzip', 'gunzip', 'zcat'];
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
app = angular.module('demo', ['ui.bootstrap', 'ui.layout']);
socket = io.connect();
app.controller('data-flow', [
  '$scope', function($scope){
    var AST, visualData;
    console.log(shellParser);
    AST = shellParser.generateAST(" diff <(zcat rev6/data.txt.gz) <(zcat rev18/data.txt.gz) ");
    visualData = shellParser.parseAST(AST);
    $scope.isImplemented = isImplemented;
    $scope.options = SelectionOptions;
    $scope.res = {
      visualData: visualData
    };
    $scope.shellText = [];
    $scope.runCommand = function(command){
      console.log($scope.res.visualData);
      console.log(shellParser.parseVisualData($scope.res.visualData));
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
      var StartPortOffset, EndPortOffset, startPosition, endPosition, startComponent, endComponent, dataedge, elem, $graphElement, graphElement, i$, ref$, len$, component, setEdgePath, update;
      dataedge = scope.$parent.edge;
      elem = element[0];
      $graphElement = element.closest('[graph-model]');
      graphElement = $graphElement[0];
      console.log("scope.visualData", scope.visualData);
      for (i$ = 0, len$ = (ref$ = scope.visualData.components).length; i$ < len$; ++i$) {
        component = ref$[i$];
        if (component.id === dataedge.startNode) {
          startComponent = component;
          startPosition = component.position;
          break;
        }
      }
      for (i$ = 0, len$ = (ref$ = scope.visualData.components).length; i$ < len$; ++i$) {
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
      datanode = scope.$parent.data;
      startX = 0;
      startY = 0;
      title = datanode.title;
      position = datanode.position;
      scope.transform = "translate(" + position.x + "px, " + position.y + "px)";
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
        if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL' || targetTag === 'BUTTON' || targetTag === 'A' || targetTag === 'TEXTAREA')) {
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
        scope.transform = "translate(" + position.x + "px, " + position.y + "px)";
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
var slice$ = [].slice;
app.directive("graphModel", function($document){
  return {
    replace: false,
    scope: {
      graphModel: '=',
      options: '='
    },
    templateUrl: 'graphTemplate.html',
    controller: [
      '$scope', '$element', '$modal', '$attrs', function(scope, element, $modal, attr){
        var pointerId, scale, graphX, graphY, startX, startY, edgeIniX, edgeIniY, elem, nodesElem, nodesElemStyle, edgesElem, edgesElemStyle, svgElem, $svgElem, workspace, $workspace, popup, $popup, popupHeight, $popupInput, toplayout, splitbar, graphModel, res$, key, ref$, val, x$, $sp, y$, update, mousemove, mouseup, newComponent, newFileComponent, newMacroComponent, newCommandComponent, mapMouseToScene, mapMouseToView, mapPointToScene, scaleFromMouse, MouseWheelHandler, mousewheelevt, simpleEdge, setEdgePath, popupState, startEdge, moveEdge, endEdge, showPopup, popupSubmit, hidePopup, hidePopupAndEdge, z$;
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
        toplayout = elem.querySelector(".toplayout");
        splitbar = elem.querySelector(".ui-splitbar");
        graphModel = scope.graphModel;
        graphModel.macros = {
          sss: shellParser.createMacro('sss', 'ddd', "grep server | gzip | zcat")
        };
        res$ = [];
        for (key in ref$ = graphModel.macros) {
          val = ref$[key];
          res$.push(key);
        }
        graphModel.macroList = res$;
        console.log(attr.demo);
        if (attr.demo !== void 8) {
          x$ = $sp = scope.$parent;
          x$.shellText = [];
          scope.$on("runCommand", function(event, message){
            var command;
            command = shellParser.parseVisualData(scope.graphModel);
            $sp.shellText.push({
              text: command,
              type: "call"
            });
            $sp.shellText.push({
              text: "this is a demo",
              type: "error"
            });
            if ($sp.shellText.length > 50) {
              return $sp.shellText = slice$.call($sp.shellText, -50);
            }
          });
        }
        y$ = scope;
        y$.safedigest = function(){
          if (!(scope.$$phase || scope.$root.$$phase)) {
            scope.$digest();
          }
        };
        y$.toNatNum = function(num){
          return num.replace(/[^\d]/, '');
        };
        y$.popupText = '';
        y$.graph = this;
        y$.$watch("graphModel", function(){
          return scope.visualData = scope.graphModel;
        });
        y$.$watch("shell", function(){
          if (!scope.shell) {
            toplayout.style.bottom = "0";
            return splitbar.style.display = "none";
          } else {
            toplayout.style.bottom = (100 - parseFloat(splitbar.style.top)) + "%";
            return splitbar.style.display = "";
          }
        });
        y$.visualData = scope.graphModel;
        y$.implementedCommands = listOfImplementedCommands;
        y$.isImplemented = isImplemented;
        y$.isArray = angular.isArray;
        y$.isString = angular.isString;
        y$.isRootView = function(){
          return deepEq$(scope.visualData, scope.graphModel, '===');
        };
        y$.toRootView = function(){
          return scope.visualData = scope.graphModel;
        };
        y$.macroViewList = function(){
          if (deepEq$(scope.visualData, scope.graphModel, '===')) {
            return graphModel.macroList;
          } else {
            return [];
          }
        };
        y$.swapPrevious = function(array, index, id){
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
        $workspace.bind("pointerdown", function(ev){
          var event, targetTag, x$;
          if (ev.which === 3) {
            return false;
          }
          event = ev.originalEvent;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'LI' || targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL' || targetTag === 'BUTTON' || targetTag === 'A' || targetTag === 'TEXTAREA')) {
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
          } else if (content.split(" ")[0].indexOf(".") > -1) {
            return newFileComponent(content.split(" ")[0], position);
          } else {
            return newMacroComponent(content, position);
          }
        };
        newFileComponent = function(filename, position){
          var visualData, newComponent;
          visualData = scope.visualData;
          newComponent = {
            type: 'file',
            id: visualData.counter++,
            filename: filename,
            position: {}
          };
          visualData.components.push(newComponent);
          importAll$(newComponent.position, position);
          return newComponent;
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
          return scope.safedigest();
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
          $popup.hide();
          scope.sel = {
            open: false
          };
          return scope.safedigest();
        };
        hidePopupAndEdge = function(){
          hidePopup();
          return endEdge();
        };
        scope.newMacroModal = function(){
          var form, modalInstance;
          form = {
            name: '',
            description: '',
            command: ''
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
            scope.graph.newMacro(form.name, form.description, form.command);
            return form.name = form.description = '';
          });
        };
        scope.macroEditModal = function(macroName){
          var macro, form, modalInstance;
          macro = graphModel.macros[macroName];
          form = {
            name: macro.name,
            description: macro.description
          };
          modalInstance = $modal.open({
            templateUrl: 'MacroEditModal.html',
            controller: function($scope, $modalInstance){
              $scope.form = form;
              $scope.cancel = function(){
                return $modalInstance.dismiss('cancel');
              };
              $scope.edit = function(){
                $modalInstance.close({
                  result: "edit"
                });
              };
              $scope['delete'] = function(){
                $modalInstance.close({
                  result: "delete"
                });
              };
              $scope.view = function(){
                $modalInstance.close({
                  result: "view"
                });
              };
            }
          });
          return modalInstance.result.then(function(selectedItem){
            var x$, res$, key;
            switch (selectedItem.result) {
            case "edit":
              graphModel.macros[form.name] = macro;
              delete graphModel.macros[macroName];
              x$ = macro;
              x$.name = form.name;
              x$.description = form.description;
              res$ = [];
              for (key in graphModel.macros) {
                res$.push(key);
              }
              graphModel.macroList = res$;
              scope.$digest();
              break;
            case "view":
              scope.graph.setGraphView(graphModel.macros[macroName]);
              break;
            case "delete":
              delete graphModel.macros[macroName];
              res$ = [];
              for (key in graphModel.macros) {
                res$.push(key);
              }
              graphModel.macroList = res$;
            }
            return form.name = form.description = '';
          });
        };
        scope.newCommandAtTopLeft = function(command){
          return newCommandComponent(command, mapPointToScene(0, 0));
        };
        this.showPopup = showPopup;
        this.popupSubmit = popupSubmit;
        this.hidePopup = hidePopup;
        this.hidePopupAndEdge = hidePopupAndEdge;
        this.nodesElement = nodesElem;
        this.newCommandComponent = newCommandComponent;
        this.newMacroComponent = newMacroComponent;
        this.startEdge = startEdge;
        this.moveEdge = moveEdge;
        this.endEdge = endEdge;
        this.mapPointToScene = mapPointToScene;
        this.mapMouseToScene = mapMouseToScene;
        this.mapMouseToView = mapMouseToView;
        z$ = this;
        z$.setSelection = function(options, obj){
          var elem, offset, position, y, x;
          scope.sel = options;
          options.open = true;
          elem = obj[0];
          offset = obj.offset();
          position = options.data.position;
          y = offset.top - 50 + elem.offsetHeight * scale;
          x = offset.left;
          options.transform = "translate(" + x + "px, " + y + "px)";
        };
        z$.selectSelection = function(value){
          var options, sel, data, name;
          options = scope.options, sel = scope.sel;
          data = sel.data, name = sel.name;
          options[data.exec].$changeToValue(data.selectors[name], name, value);
          return sel.open = false;
        };
        z$.removeComponent = function(component){
          scope.visualData.removeComponent(component);
        };
        z$.isFreeSpace = function(elem){
          return elem === svgElem || elem === workspace || elem === nodesElem;
        };
        z$.updateScope = function(){
          return scope.$digest();
        };
        z$.getVisualData = function(){
          return scope.visualData;
        };
        z$.setGraphView = function(view){
          hidePopupAndEdge();
          scope.visualData = view;
          scope.$digest();
        };
        z$.revertToRoot = function(){
          scope.visualData = graphModel;
        };
        z$.newMacro = function(name, descr, command){
          var res$, key;
          graphModel.macros[name] = shellParser.createMacro(name, descr, command);
          res$ = [];
          for (key in graphModel.macros) {
            res$.push(key);
          }
          graphModel.macroList = res$;
        };
        z$.translateNode = function(id, position, x, y){
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
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) { 
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
app.directive("elscope", function($document){
  return {
    link: function(scope, element){
      scope.scopedElement = element;
    }
  };
});
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