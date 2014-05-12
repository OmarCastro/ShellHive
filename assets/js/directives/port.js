
app.directive("port", function($document){
  return {
    require: '^graph',
    scope: true,
    link: function(scope, element, attr, graphController){
      var ref$, ConnectIfOk, mousemove, mouseup;
      var datanode = scope.$parent.data;
      var title = datanode.title;
      var position = datanode.position;
      var elem = element[0];
      var imstyle = elem.style;
      scope.componentId = datanode.id;
      scope.isOutputNode = graphController.isOutputPort(attr.port)
      element.bind("pointerdown", function(ev){
        var event, x$;
        console.log(ev);
        event = ev.originalEvent;
        graphController.startEdge(elem, position, event);
        $document.bind("pointermove", mousemove);
        $document.bind("pointerup", mouseup);
        return false;
      });
      var ConnectIfOk = function(startNode, startPort, endNode, endPort){
        var visualData, isOk, i$, ref$, len$, x;
        visualData = graphController.getVisualData();
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
          graphController.updateScope();
        }
      };
      mousemove = function(ev){
        graphController.moveEdge(ev.originalEvent);
      };
      mouseup = function(ev){
        var event, pointedElem, $pointedElem, ref$, outAttr, outPortScope, x$;
        event = ev.originalEvent;
        pointedElem = document.elementFromPoint(event.clientX, event.clientY);
        $pointedElem = $(pointedElem);
        if (graphController.isFreeSpace(pointedElem)) {
          if (graphController.isOutputPort(attr.port)) {
            graphController.showPopup(event, scope.componentId, attr.port, null, 'input');
          } else {
            graphController.showPopup(event, null, 'output', scope.componentId, attr.port);
          }
        } else {
          graphController.endEdge();
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
