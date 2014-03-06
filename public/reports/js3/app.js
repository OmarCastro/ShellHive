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
app.controller('examples', function($scope){
  var examples, results, res$, i$, len$, index, example, AST, visualData, x$;
  $scope.options = SelectionOptions;
  examples = examplesControllerData;
  res$ = [];
  for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
    index = i$;
    example = examples[i$];
    AST = shellParser.generateAST(example.command);
    visualData = shellParser.parseAST(AST);
    AST = JSON.stringify(AST, undefined, 2);
    res$.push({
      id: index,
      title: example.title,
      command: example.command,
      AST: AST,
      visualData: visualData,
      JSONVisualData: JSON.stringify(visualData, undefined, 2)
    });
  }
  results = res$;
  x$ = $scope;
  x$.TransformResults = results;
  x$.tab = results[0].id;
  x$.updateTab = function(id){
    return $scope.tab = id;
  };
  x$.isImplemented = isImplemented;
  return x$;
});
app.controller('visual2text', function($scope){
  var examples, results, i$, len$, i, example, AST, visualData;
  $scope.updateTab = function(id){
    return $scope.tab = id;
  };
  $scope.isImplemented = isImplemented;
  $scope.options = SelectionOptions;
  examples = visual2textControllerData;
  results = [];
  $scope.TransformResults = results;
  for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
    i = i$;
    example = examples[i$];
    example = examples[i];
    AST = shellParser.generateAST(example.command);
    visualData = shellParser.parseAST(AST);
    results.push({
      id: i,
      title: example.title,
      command: example.command,
      visualData: visualData
    });
    (fn$.call(this, i, i, example));
  }
  return $scope.tab = results[0].id;
  function fn$(indx, i, example){
    $scope.$watch("TransformResults[" + indx + "].visualData.components", function(newValue){
      return results[indx].command = shellParser.parseComponent(newValue[0]);
    }, true);
  }
});
app.controller('ASTTester', function($scope){
  var tests, testResults, res$, i$, len$, index, test, ast, results, res1$, j$, ref$, len1$, assert, result;
  $scope.updateTab = function(id){
    return $scope.tab = id;
  };
  tests = AST_tests;
  res$ = [];
  for (i$ = 0, len$ = tests.length; i$ < len$; ++i$) {
    index = i$;
    test = tests[i$];
    ast = shellParser.generateAST(test.command);
    res1$ = [];
    for (j$ = 0, len1$ = (ref$ = test.asserts).length; j$ < len1$; ++j$) {
      assert = ref$[j$];
      result = new Function('ast', 'equals', 'return ' + assert)(angular.copy(ast), angular.equals);
      res1$.push({
        command: assert,
        result: result,
        'class': result === true ? 'passed' : 'failed'
      });
    }
    results = res1$;
    res$.push({
      id: index,
      title: test.title,
      command: test.command,
      ast: JSON.stringify(ast, void 8, 2),
      results: results
    });
  }
  testResults = res$;
  $scope.testResults = testResults;
  return $scope.tab = testResults[0].id;
});
app.controller('ast-playground', function($scope){
  $scope.builder = {
    code: '',
    result: '',
    error: false
  };
  return $scope.generateAST = function(){
    var builder, err;
    builder = $scope.builder;
    if (builder.code === '') {
      return builder.result = '';
    }
    try {
      builder.result = JSON.stringify(shellParser.generateAST(builder.code), void 8, 2);
      return builder.error = false;
    } catch (e$) {
      err = e$;
      builder.error = true;
      return builder.result = 'compilation error \n' + err.message.split('\n').slice(1, 3).join('\n');
    }
  };
});
app.controller('visual-playground', function($scope){
  var emptyresult, x$, translateX, translateY, startX, startY;
  emptyresult = {
    components: [],
    connections: []
  };
  $scope.generateAST = function(){
    var builder, err;
    builder = $scope.builder;
    if (builder.code === '') {
      return builder.result = emptyresult;
    }
    try {
      builder.result = shellParser.parseCommand(builder.code);
      return builder.error = false;
    } catch (e$) {
      err = e$;
      builder.error = 'compilation error \n' + err.stack;
      return builder.result = emptyresult;
    }
  };
  x$ = $scope;
  x$.screenHeight = window.screen.availHeight;
  x$.options = SelectionOptions;
  x$.isImplemented = isImplemented;
  x$.builder = {
    code: '',
    result: emptyresult,
    error: false
  };
  translateX = 0;
  translateY = 0;
  startX = 0;
  return startY = 0;
});
app.controller('data-flow', function($scope){
  var emptyresult, connectors, examples, results, res$, i$, len$, index, example, translateX, translateY, startX, startY, parseExample, x$;
  emptyresult = {
    components: [],
    connections: []
  };
  $scope.options = SelectionOptions;
  connectors = [];
  examples = [
    {
      title: "single",
      command: "ls -IAmACoolGuy"
    }, {
      title: "pipe",
      command: "grep 2004 | cat uselessUseOfCat.txt | grep \"oh really\" | grep \"yes really\" | cat | cat | gzip"
    }, {
      title: "process substitution",
      command: "cat <(grep 2004 events.txt) <(grep 1958 ye_olde_events.txt)"
    }, {
      title: "tee",
      command: "cat | tee >(cat) >(cat) | cat"
    }, {
      title: "process substitution tree",
      command: "cat <( cat <(grep \"cat\" cat.cat.txt) <(grep t2 txt.txt) ) <(grep 1 min.txt) <(grep 2 max.txt) | cat - <(cat min.txt)"
    }, {
      title: "a long workflow",
      command: "grep 'for test purposes only' <( cat - <(grep 1 txt.txt) <(grep t2 txt2.txt) ) <(grep 2 txt.txt) <(grep 3 txt2.txt) | cat - <(cat <(grep txt) <(grep t2) ) | cat | grep 'its complex alright' <(cat <(grep txt | tee >(bzip2) | cat) - <(grep t2 ni.txt) ) | tee >(bzip2) >(grep mimi <(cat ni.txt) | cat | tee >(cat | gzip) | bzip2) | grep | tee >(bzip2) | gzip"
    }
  ];
  res$ = [];
  for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
    index = i$;
    example = examples[i$];
    res$.push({
      id: index,
      title: example.title,
      command: example.command,
      visualData: emptyresult,
      parsed: false
    });
  }
  results = res$;
  translateX = 0;
  translateY = 0;
  startX = 0;
  startY = 0;
  parseExample = function(num){
    var result, AST, visualData, x$;
    result = $scope.TransformResults[num];
    if (result.parsed) {
      return;
    }
    AST = shellParser.generateAST(result.command);
    visualData = shellParser.parseAST(AST);
    x$ = result;
    x$.visualData = visualData;
    x$.parsed = true;
    return x$;
  };
  x$ = $scope;
  x$.TransformResults = results;
  x$.screenHeight = window.screen.availHeight;
  x$.tab = results[0].id;
  x$.updateTab = function(id){
    parseExample(id);
    return $scope.tab = id;
  };
  x$.isImplemented = isImplemented;
  return parseExample(0);
});
var activeDrop;
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
      requestAnimationFrame(function(){
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
      });
    }
  };
});
app.directive("component", function($document){
  var pointerId;
  pointerId = 0;
  return {
    scope: true,
    link: function(scope, element, attr){
      var datanode, startX, startY, title, position, elem, imstyle, resultScope, mousemove, moveTo, mouseup;
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
      resultScope = scope;
      while (!resultScope.hasOwnProperty("visualData") && resultScope !== scope.$root) {
        resultScope = resultScope.$parent;
      }
      scope.moveTo = function(newX, newY){
        position.x += newX;
        position.y += newY;
      };
      element.bind("pointerdown", function(ev){
        var event, targetTag, pointerId, x$;
        event = ev.originalEvent;
        targetTag = event.target.tagName;
        if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
          return;
        }
        pointerId = event.pointerId;
        x$ = $document;
        x$.bind("pointermove", mousemove);
        x$.bind("pointerup", mouseup);
        startX = event.screenX;
        startY = event.screenY;
        event.preventDefault();
        event.stopPropagation();
      });
      mousemove = function(ev){
        var event;
        event = ev.originalEvent;
        moveTo(event.screenX - startX, event.screenY - startY);
        startX = event.screenX;
        startY = event.screenY;
      };
      moveTo = function(newX, newY){
        resultScope.translateNode(datanode.id, position, newX, newY);
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
app.directive("graphModel", function($document){
  return {
    restrict: 'A',
    replace: false,
    scope: {
      visualData: '=graphModel',
      options: '='
    },
    controller: [
      '$scope', '$element', '$attrs', function(scope, element, attr){
        var pointerId, scale, graphX, graphY, startX, startY, elem, x$, nodesElem, edgesElem, svgElem, $svgElem, nodesElemStyle, edgesElemStyle, mousemove, mouseup, mapPointToScene, multScale, MouseWheelHandler, mousewheelevt, simpleEdge, edgeIniX, edgeIniY, edgeEndX, edgeEndY, setEdgePath, y$;
        pointerId = 0;
        scale = 1;
        graphX = 0;
        graphY = 0;
        startX = 0;
        startY = 0;
        elem = element[0];
        x$ = scope;
        x$.transform = cssTransform.replace(/[A-Z]/g, function(v){
          return "-" + v.toLowerCase();
        });
        x$.implementedCommands = listOfImplementedCommands;
        x$.graphX = graphX;
        x$.graphY = graphX;
        elem.style[cssTransform] = "translate3d(0,0,0)";
        nodesElem = elem.querySelector(".nodes");
        edgesElem = elem.querySelector(".edges");
        svgElem = elem.querySelector("svg");
        $svgElem = $(svgElem);
        nodesElemStyle = nodesElem.style;
        edgesElemStyle = edgesElem.style;
        function update(){
          var transform, x$;
          transform = "translate(" + graphX + "px, " + graphY + "px) scale(" + scale + ")";
          nodesElemStyle[cssTransform] = transform;
          edgesElemStyle[cssTransform] = transform;
          x$ = scope;
          x$.graphX = graphX;
          x$.graphY = graphX;
          return x$;
        }
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
          var pointerId, x$;
          pointerId = 0;
          x$ = $document;
          x$.unbind("pointermove", mousemove);
          x$.unbind("pointerup", mouseup);
          return x$;
        };
        element.bind("pointerdown", function(ev){
          var event, targetTag, pointerId, x$;
          event = ev.originalEvent;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
            return;
          }
          pointerId = event.pointerId;
          x$ = $document;
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });
        mapPointToScene = function(x, y){
          return {
            x: x / scale - graphX,
            y: y / scale - graphY
          };
        };
        multScale = function(sVal, event){
          var offset, relpointX, relpointY;
          if ((scale < 0.2 && sVal < 1) || (scale > 20 && sVal > 1)) {
            return;
          }
          offset = $svgElem.offset();
          relpointX = event.pageX - offset.left - graphX;
          relpointY = event.pageY - offset.top - graphY;
          graphX += (-relpointX) * sVal + relpointX;
          graphY += (-relpointY) * sVal + relpointY;
          scale *= sVal;
          update();
        };
        MouseWheelHandler = function(event){
          if (!event.altKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if ((event.wheelDelta || -event.detail) > 0) {
            return multScale(1.1, event);
          } else {
            return multScale(0.9, event);
          }
        };
        mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
        scope.translateNode = function(id, position, x, y){
          var i$, ref$, len$, el;
          position.x += x / scale;
          position.y += y / scale;
          scope.$digest();
          for (i$ = 0, len$ = (ref$ = edgesElem.querySelectorAll("[connector]")).length; i$ < len$; ++i$) {
            el = ref$[i$];
            $(el).scope().updateWithId(id);
          }
        };
        scope.isImplemented = isImplemented;
        simpleEdge = element.find('.emptyEdge')[0];
        edgeIniX = 0;
        edgeIniY = 0;
        edgeEndX = 0;
        edgeEndY = 0;
        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return simpleEdge.setAttribute('d', "M " + iniX + " " + iniY + " H " + (iniX + 0.5 * xpoint) + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY + " H " + endX);
        };
        y$ = this;
        y$.startEdge = function(elem, position, ev){
          edgeIniX = elem.offsetLeft + position.x;
          edgeIniY = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
          edgeEndX = edgeIniX;
          edgeEndY = edgeIniY;
          return setEdgePath(edgeIniX, edgeIniY, edgeEndX, edgeEndY);
        };
        y$.moveEdge = function(x, y){
          edgeEndX += x / scale;
          edgeEndY += y / scale;
          return setEdgePath(edgeIniX, edgeIniY, edgeEndX, edgeEndY);
        };
        y$.endEdge = function(){
          return simpleEdge.setAttribute('d', "M 0 0");
        };
        y$.updateScope = function(){
          return scope.$digest();
        };
        y$.visualData = scope.visualData;
        y$.mapPointToScene = mapPointToScene;
      }
    ]
  };
});
app.directive("port", function($document){
  return {
    require: '^graphModel',
    scope: true,
    link: function(scope, element, attr, graphModelController){
      var datanode, startX, startY, title, position, elem, imstyle, ref$, ConnectIfOk, mousemove, moveTo, mouseup;
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
      scope.componentId = datanode.id;
      scope.isOutputNode = (ref$ = attr.port) === 'output' || ref$ === 'error' || ref$ === 'retcode';
      element.bind("pointerdown", function(ev){
        var event, x$;
        event = ev.originalEvent;
        graphModelController.startEdge(elem, position, event);
        x$ = $document;
        x$.bind("pointermove", mousemove);
        x$.bind("pointerup", mouseup);
        startX = event.screenX;
        startY = event.screenY;
        return false;
      });
      ConnectIfOk = function(startNode, startPort, endNode, endPort){
        var visualData, existCycle, i$, ref$, len$, x;
        visualData = graphModelController.visualData;
        existCycle = false;
        for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
          x = ref$[i$];
          if (x.startNode === endNode && x.endNode === startNode) {
            existCycle = true;
            break;
          }
        }
        if (!existCycle) {
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
        var event;
        event = ev.originalEvent;
        moveTo(event.screenX - startX, event.screenY - startY);
        startX = event.screenX;
        startY = event.screenY;
      };
      moveTo = function(newX, newY){
        graphModelController.moveEdge(newX, newY);
      };
      mouseup = function(ev){
        var event, pointedElem, outAttr, outPortScope, x$;
        graphModelController.endEdge();
        event = ev.originalEvent;
        pointedElem = $(document.elementFromPoint(event.clientX, event.clientY));
        outAttr = pointedElem.attr("data-port");
        if (outAttr) {
          outPortScope = pointedElem.scope();
          if (scope.isOutputNode !== outPortScope.isOutputNode) {
            if (scope.isOutputNode) {
              ConnectIfOk(scope.componentId, attr.port, outPortScope.componentId, outAttr);
            } else {
              ConnectIfOk(outPortScope.componentId, outAttr, scope.componentId, attr.port);
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
app.directive('sidebar', [
  '$document', function($document){
    return {
      scope: true,
      require: '^graphModel',
      link: function(scope, element, attr, graphModelCtrl){
        requestAnimationFrame(function(){
          return element.find('li').each(function(index){
            return $(this).bind('click', function(ev){
              var newResult, x$, newComponent;
              ev.stopPropagation();
              newResult = shellParser.parseCommand(listOfImplementedCommands[index]);
              x$ = newComponent = newResult.components[0];
              x$.id = graphModelCtrl.visualData.components.length;
              x$.position = graphModelCtrl.mapPointToScene(0, 0);
              graphModelCtrl.visualData.components.push(newComponent);
              return graphModelCtrl.updateScope();
            });
          });
        });
      }
    };
  }
]);
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