(function(){
  var graph, nodes, edges, pointers, graphData, cssTransform, socket, app, x$;
  graph = document.querySelector('div.graph');
  nodes = document.querySelector('div.nodes');
  edges = document.querySelector('svg.edges');
  pointers = {};
  graphData = null;
  /**
    gets the first supported proprieties in CSS
    used to resolve prefixes
  
    @param {Array.<string>} proparray - a list of arrays
    @return{string} the supported proprierty
  */
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
  cssTransform = getCSSSupportedProp(['transform', 'WebkitTransform', 'MozTransform']);
  socket = io.connect();
  socket.on('nodePosChanged', function(data){
    requestAnimationFrame(function(){
      return graphData.nodes[data.id].api.moveTo(data.x, data.y);
    });
  });
  app = angular.module("drag", []);
  app.controller("Controller", function($scope){
    $scope.dataNodes = [];
    $scope.dataEdges = [];
    socket.on('flowData', function(data){
      var k, ref$, v;
      graphData = data;
      for (k in ref$ = data.nodes) {
        v = ref$[k];
        if (k === "maxid") {
          continue;
        }
        v.edges = [];
        $scope.dataNodes.push(v);
      }
      for (k in ref$ = data.edges) {
        v = ref$[k];
        if (k === "maxid") {
          continue;
        }
        $scope.dataEdges.push(v);
      }
      $scope.$apply();
    });
    socket.emit('graph-user', "");
  });
  x$ = app;
  x$.directive("component", function($document){
    var pointerId;
    pointerId = 0;
    return {
      scope: true,
      link: function(scope, element, attr){
        var datanode, startX, startY, title, x, y, elem, imstyle, mousemove, moveTo, updatePos, mouseup, rect, inputelem, input, outputelem, output, inputX, inputY, outputX, outputY;
        datanode = scope.$parent.node;
        startX = 0;
        startY = 0;
        title = datanode.title;
        x = datanode.x;
        y = datanode.y;
        elem = element[0];
        imstyle = elem.style;
        element.bind("pointerdown", function(event){
          var targetTag, pointerId, x$;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
            return;
          }
          pointerId = event.pointerId;
          x$ = $document;
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX - x;
          startY = event.screenY - y;
          event.preventDefault();
          event.stopPropagation();
        });
        mousemove = function(event){
          moveTo(event.screenX - startX, event.screenY - startY);
          socket.emit('nodePosChanged', {
            id: datanode.id,
            x: x,
            y: y
          });
        };
        moveTo = function(newX, newY){
          x = newX;
          y = newY;
          updatePos();
        };
        updatePos = function(){
          var tr, i$, ref$, len$, edge;
          tr = "translate(" + x + "px, " + y + "px)";
          imstyle[cssTransform] = tr;
          for (i$ = 0, len$ = (ref$ = datanode.edges).length; i$ < len$; ++i$) {
            edge = ref$[i$];
            edge.api.updateEdge();
          }
        };
        mouseup = function(){
          var pointerId, x$;
          pointerId = 0;
          x$ = $document;
          x$.unbind("pointermove", mousemove);
          x$.unbind("pointerup", mouseup);
          return x$;
        };
        rect = elem.getBoundingClientRect();
        elem.style.minWidth = rect.width + "px";
        inputelem = elem.querySelector("div.input .box");
        input = inputelem.getBoundingClientRect();
        outputelem = elem.querySelector("div.output .box");
        output = outputelem.getBoundingClientRect();
        inputX = input.left + input.width / 2 - rect.left;
        inputY = input.top + input.height / 2 - rect.top;
        outputX = output.left + output.width / 2 - rect.left;
        outputY = output.top + output.height / 2 - rect.top;
        datanode.api = {
          inputPos: function(){
            return {
              x: x + inputX,
              y: y + inputY
            };
          },
          outputPos: function(){
            return {
              x: x + outputX,
              y: y + outputY
            };
          },
          pos: function(){
            return {
              x: x,
              y: y
            };
          },
          size: {
            width: rect.width,
            height: rect.height
          },
          getbbox: function(){
            return elem.firstChild.getBoundingClientRect();
          },
          moveTo: moveTo
        };
        updatePos();
      },
      restrict: 'C'
    };
  });
  x$.directive("connector", function($document){
    return {
      scope: true,
      link: function(scope, element, attr){
        var dataedge, startNode, endNode, elem, setEdgePath, updateEdge;
        dataedge = scope.$parent.edge;
        startNode = graphData.nodes[dataedge.start];
        endNode = graphData.nodes[dataedge.end];
        startNode.edges.push(dataedge);
        endNode.edges.push(dataedge);
        elem = element[0];
        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return elem.setAttribute('d', "M " + iniX + " " + iniY + " C " + (iniX + xpoint) + "," + iniY + " " + (iniX + xpoint * 3) + "," + endY + " " + endX + "," + endY);
        };
        updateEdge = function(){
          var startNodePos, endNodePos;
          startNodePos = startNode.api.outputPos();
          endNodePos = endNode.api.inputPos();
          return setEdgePath(startNodePos.x, startNodePos.y, endNodePos.x, endNodePos.y);
        };
        dataedge.api = {
          updateEdge: updateEdge
        };
        elem.addEventListener('pointerdown', function(){
          elem.classList.toggle('sel');
          if (elem.classList.contains('sel')) {
            socket.emit('run-app', {
              id: 1
            });
          }
        });
        updateEdge();
      }
    };
  });
}).call(this);
