import * as app from "../../app.module"
import { Graph, Connection } from "../../../graph"
import { GraphController } from "../graph/graph.controller"

interface MiniConnectorScope extends angular.IScope{
  graphElement: JQuery
  edge: Connection
  endPos: Point
  startPos: Point
}

app.directive("workspace", ['$document', function($document){
  return {
    scope: true,
    restrict: 'A',
    require: '^graph',
    link: function(scope:MiniConnectorScope , element, attr, graphController: GraphController){
        let pointerId = 0;
        let startX = 0;
        let startY = 0;

        function targetBelowWorkspace(ev): Element{
          const mx = ev.clientX
          const my = ev.clientY
          element.hide()
          const target = document.elementFromPoint(mx, my)
          element.show()
          console.log("tagname", target.tagName);
          return target
        }

        element.bind("pointerdown", function(ev: any){
          console.log(ev);
          const event = ev.originalEvent;
          if (ev.which === 3) {
            return false;
          }
          if(pointerId) return
          const tagsToIgnore = "span, li, input, select, label, button, a, textarea".split(", ")
          const targetTag = (event.target as HTMLElement).tagName;
          if (tagsToIgnore.indexOf(targetTag.toLowerCase()) >= 0) {
            return;
          }
          graphController.hidePopupAndEdge();
          
          const pathTarget = targetBelowWorkspace(ev)
          if(pathTarget.tagName.toLowerCase() === "path"){
            event.preventDefault();
            event.stopPropagation();
            return $(pathTarget).trigger(ev)
          }

          pointerId = event.pointerId;
          $document.bind("pointermove", mousemove);
          $document.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });

        function mousemove(ev){
          var event = ev.originalEvent;
          const dx = event.screenX - startX;
          const dy = event.screenY - startY;
          graphController.translateGraphXY(dx, dy);
          startX = event.screenX;
          startY = event.screenY;
        };

        function mouseup(){
          pointerId = 0;
          $document.unbind("pointermove", mousemove);
          $document.unbind("pointerup", mouseup);
        };

        element.bind("contextmenu", function(ev: JQueryEventObject){
            if (ev.shiftKey) { return; }
            ev.preventDefault();
            ev.stopPropagation();
            graphController.showPopup(ev, null, null, null, null);
        })

    }
  };
}]);

