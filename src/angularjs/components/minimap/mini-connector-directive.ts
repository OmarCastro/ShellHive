import * as app from "../../app.module"
import { Graph, Connection } from "../../../graph"
import { Position } from "../../../math"


interface MiniConnectorScope extends angular.IScope{
  graphElement: JQuery
  $parent: any
  endPos: Position
  startPos: Position
}

app.directive("miniconnector", function(){
  return {
    scope: true,
    link: function(scope:MiniConnectorScope , element, attr){

      const dataedge: Connection = scope.$parent.edge;
      const elem = element[0];
      const startComponent = dataedge.startComponent;
      const startPosition = startComponent.position;
      const endComponent = dataedge.endComponent;
      const endPosition = endComponent.position;
      scope.endPos = endPosition
      scope.startPos = startPosition

      function updateEdge(){
        const iniX = startPosition.x + 50
        const iniY = startPosition.y + 50
        const endX = endPosition.x + 50
        const endY = endPosition.y + 50
        const xpoint = (endX - iniX) / 4;

        elem.setAttribute(
          'd', "M " + iniX + " " + iniY 
            + " H " + (iniX + 0.5 * xpoint) 
            + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
            + " H " + endX);
      }

      const elementClass = "from-"+startComponent.type;
      elem.classList.add(elementClass);
      elem.classList.add(elementClass+"-"+dataedge.startPort);
      scope.$watch("endPos",updateEdge, true);
      scope.$watch("startPos",updateEdge, true);
      
    }
  };
});

