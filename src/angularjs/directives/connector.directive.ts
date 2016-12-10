import * as app from "../app.module"
import { projectId } from "../utils"
import {SocketService} from "../socket.service"
import router from "../router"
import { Graph, Connection } from "../../graph"
import { Position } from "../../math"

interface ConnectorsScope extends angular.IScope{
  $parent: any
  graphElement: JQuery;
  endsPositions: {x: number, y:number}[]
  $index: number
  edgePopups: any[]
  update: (startPos?, endPos?) => void
  reset: () => void

}

app.directive("connector", ['$timeout', ($timeout) => ({
    scope: true,
    restrict: "A",
    link: function(scope: ConnectorsScope, element, attr){
      const StartPortOffset = {top: 0, left:0, right: 0, isNull: true};
      const EndPortOffset = {top: 0, left:0, isNull: true} ;
      
      const dataedge: Connection = scope.$parent.edge;
      const elem = element[0];
      const $graphElement = scope.graphElement;
      const graphElement = $graphElement[0];
      
      
      const startComponent = dataedge.startComponent;
      const startPosition = startComponent.position;
      const endComponent = dataedge.endComponent;
      const endPosition = endComponent.position;
      scope.endsPositions = [startPosition,endPosition]
      
      function queryConnectorInfo(){
        const Startnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.startNode + "']") as HTMLElement;
        const StartPort = Startnode.querySelector("[data-port='" + dataedge.startPort + "'] > .box") as HTMLElement;
        const Endnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.endNode + "']") as HTMLElement;
        const EndPort = Endnode.querySelector("[data-port='" + dataedge.endPort + "'] > .box") as HTMLElement;
        
        StartPortOffset.top = StartPort.offsetTop + StartPort.offsetHeight * 0.75;
        StartPortOffset.left = StartPort.offsetLeft;
        StartPortOffset.right = StartPort.offsetLeft + StartPort.offsetWidth
        StartPortOffset.isNull = false;

        EndPortOffset.top = EndPort.offsetTop + EndPort.offsetHeight * 0.75,
        EndPortOffset.left = EndPort.offsetLeft
        EndPortOffset.isNull = false;
      }

       function update(startPos?: Position, endPos?: Position){
          if(StartPortOffset.isNull || EndPortOffset.isNull){
            queryConnectorInfo();
          }
          if(startPos){
            startPosition.x = startPos.x;
            startPosition.y = startPos.y; 
          }
          if(endPos){
            endPosition.x = endPos.x;
            endPosition.y = endPos.y; 
          }

          setEdgePath(startPosition.x + StartPortOffset.right - 2, 
                      startPosition.y + StartPortOffset.top,
                      endPosition.x + EndPortOffset.left + 2,
                      endPosition.y + EndPortOffset.top);
      };
      
      const elementClass = "from-"+startComponent.type;
      elem.classList.add(elementClass);
      elem.classList.add(elementClass+"-"+dataedge.startPort);
      
      element.bind("pointerdown", function(event){
        const orig = event.originalEvent;
        const clientX = (orig as any).clientX
        const clientY = (orig as any).clientY
        scope.$apply(function(){
          const data = {
            x: clientX,
            y: clientY,
            transform: `translate(${clientX}px,${clientY}px)`,
            index: scope.$index,
            id: dataedge.id
          }
          if(scope.edgePopups.length){
            scope.edgePopups[0] = data;
          } else {
            scope.edgePopups.push(data);
          }

        });
      });

      function setEdgePath(iniX, iniY, endX, endY){
        const xpoint = (endX - iniX) / 4;
        elem.setAttribute(
          'd', "M " + iniX + " " + iniY 
            + " H " + (iniX + 0.5 * xpoint) 
            + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
            + " H " + endX);
      };
     
      scope.update = update;


      
      scope.reset = function(){
        queryConnectorInfo();
        update();
      };

      $timeout(function(){
        scope.$watch('edge.endPort', scope.reset);
        requestAnimationFrame(scope.reset)
      });
    }
})]);
