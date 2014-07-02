
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

      var mIn= "macroIn"
      var mOut= "macroOut"

      if(datanode.type == "input" || (attr.port.slice(0,mOut.length) == mOut && datanode.type != "output")){
        scope.isOutputNode = true
      } else if(datanode.type == "output" || (attr.port.slice(0,mIn.length) == mIn && datanode.type == "input")){
        scope.isOutputNode = false
      } else {
        scope.isOutputNode = graphController.isOutputPort(attr.port)
      }

      element.bind("pointerdown", function(ev){
        var event = ev.originalEvent;
        graphController.startEdge(elem, datanode.type, attr.port, position, event);
        $document.bind("pointermove", mousemove);
        $document.bind("pointerup", mouseup);
        return false;
      });



      element.hover(
        function(){ $(this).addClass('hover') },
        function(){ $(this).removeClass('hover') }
      )

      var ConnectIfOk = function(startNode, startPort, endNode, endPort){
        scope.$emit('connectComponent',{
          startNode: startNode,
          startPort: startPort,
          endNode: endNode,
          endPort: endPort
        });
      };
      mousemove = function(ev){
        graphController.moveEdge(ev.originalEvent);
        return true;
      };
      mouseup = function(ev){
        var event, pointedElem, $pointedElem, ref$, outAttr, outPortScope, x$;
        event = ev.originalEvent;
        pointedElem = document.elementFromPoint(event.clientX, event.clientY);
        $pointedElem = $(pointedElem);




        if (graphController.isFreeSpace(pointedElem)) {
          if (scope.isOutputNode) {
            graphController.showPopup(event, scope.componentId, attr.port, null, 'input');
          } else {
            graphController.showPopup(event, null, 'output', scope.componentId, attr.port);
          }
        }


         else {
          graphController.endEdge();

          outAttr = $pointedElem.attr("data-port") || $pointedElem.parent().attr("data-port");
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
