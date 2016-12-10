import * as app from "../app.module"

app.directive("port", ['$document',($document) => ({
    require: '^graph',
    scope: true,
    link: function(scope:any, element: JQuery, attr:any, graphController:any){
      var datanode = scope.$parent.data;
      var title = datanode.title;
      var position = datanode.position;
      const elem = element[0];
      const imstyle = elem.style;
      scope.componentId = datanode.id;

      const mIn= "macroIn"
      const mOut= "macroOut"

      if(datanode.type == "input" || (attr.port.slice(0,mOut.length) == mOut && datanode.type != "output")){
        scope.isOutputNode = true
      } else if(datanode.type == "output" || (attr.port.slice(0,mIn.length) == mIn && datanode.type == "input")){
        scope.isOutputNode = false
      } else {
        scope.isOutputNode = graphController.isOutputPort(attr.port)
      }

      element.bind("pointerdown", function(ev){
        graphController.startEdge(elem, datanode.type, attr.port, position, (ev as any).originalEven);
        $document.bind("pointermove", mousemove);
        $document.bind("pointerup", mouseup);
        return false;
      });



      element.hover(
        function(){ $(this).addClass('hover') },
        function(){ $(this).removeClass('hover') }
      )

      function ConnectIfOk(startNode, startPort, endNode, endPort){
        scope.$emit('connectComponent',{
          startNode: startNode,
          startPort: startPort,
          endNode: endNode,
          endPort: endPort
        });
      };
      function mousemove(ev){
        graphController.moveEdge(ev.originalEvent);
        return true;
      };
      function mouseup(ev){
        var outPortScope;
        const event = ev.originalEvent;
        const pointedElem = document.elementFromPoint(event.clientX, event.clientY);
        const $pointedElem = $(pointedElem);




        if (graphController.isFreeSpace(pointedElem)) {
          if (scope.isOutputNode) {
            graphController.showPopup(event, scope.componentId, attr.port, null, 'input');
          } else {
            graphController.showPopup(event, null, 'output', scope.componentId, attr.port);
          }
        }


         else {
          graphController.endEdge();

          const outAttr = $pointedElem.attr("data-port") || $pointedElem.parent().attr("data-port");
          if (outAttr) {
            const outPortScope = $pointedElem.scope() as any;
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
  })]);
