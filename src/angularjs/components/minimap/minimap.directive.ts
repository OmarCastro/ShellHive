import * as app from "../../app.module"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import { Graph, Connection } from "../../../graph"
import { GraphController } from "../graph/graph.controller"
import template = require("./minimap.html")

export interface MinimapScope extends angular.IScope{
  graphElement: JQuery
  scale: number
  mapSize: number
  viewport: any
  transform: string
  boundaries: () => {x1:number,y1:number,x2:number,y2:number}
  visualData: Graph
}

app.directive("minimap", () => ({
    scope: true,
    require: '^graph',
    template: template,
    link: function(scope: MinimapScope, element, attr, graphController: GraphController){
      var $graphElement = scope.graphElement;
      var workspace = $graphElement[0].querySelector(".workspace") as HTMLElement;
      var elem = element[0];
      var boundary = {x1:0,y1:0,x2:0,y2:0};
      var graphX = 0
      var graphY = 0

      scope.scale = 1;
      var viewbox =  element.find(".viewbox");

      var mapSize = 150;
      scope.mapSize = mapSize;
      var margin = 200 //margin to view all nodes

      scope.$on("Graph::Minimap::UpdateViewPort", (event, viewport) => updateViewport(viewport));

      function updateViewport(viewport: IViewBox){
        const scale = scope.scale;
        const {topLeft, bottomRight} = viewport
        viewbox.css({
          transform: "translate("+(-topLeft.x)+"px, "+(-topLeft.y)+"px)",
          width: (bottomRight.x-topLeft.x),
          height: (bottomRight.y-topLeft.y),
          borderWidth: 1/scale+"px"
        })
      }
      requestAnimationFrame(function(){
        updateViewport({
           topLeft:{x:0, y:0},
           bottomRight:{x:workspace.offsetWidth,y:workspace.offsetHeight}
          })
      });

        function mapMouseToScene(event){
          const {x,y} = mapMouseToView(event);
          return mapPointToScene(x, y);
        };

        function mapMouseToView(event){
          const offset = element.offset();
          return {
            x: Math.round(event.pageX - offset.left),
            y: Math.round(event.pageY - offset.top)
          };
        };

        function mapPointToScene(x, y){
          const scale = scope.scale;
          return {
            x: (x/ scale - graphX) ,
            y: (y/ scale - graphY)
          };
        };

        function pointerEvent(ev){
          var event = ev.originalEvent
          var viewport = scope.viewport;
          var point = mapMouseToScene(event)
          var width = (viewport.x2 -viewport.x1)
          var height = (viewport.y2 -viewport.y1)
          var midX = width/2;
          var midY = height/2;
          
          var newX = (point.x - midX)
          var newY = (point.y - midY)
          

          //console.log(point, {x: midX, y:midY, w:width, h:height} , {newX: newX, newY:newY});

          graphController.moveScene(-newX,-newY);
          event.preventDefault();
          event.stopPropagation();
        }

        element.bind("pointerdown", function(ev){ pointerEvent(ev); element.bind("pointermove", pointerEvent); });
        element.bind("pointerup", function(ev){element.unbind("pointermove", pointerEvent);});

        var MouseWheelHandler = function(event){
          event.preventDefault();
          event.stopPropagation();
        };
        const mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);

      scope.boundaries = function(){
        var components = scope.visualData.components;
        if(!components || components.length == 0) return;
        var firstComponentPosition = components[0].position
        var minX = firstComponentPosition.x;
        var minY = firstComponentPosition.y;
        var maxX = firstComponentPosition.x;
        var maxY = firstComponentPosition.y;
        components.forEach(function(component){
          var position = component.position;
          if(minX > position.x){ minX = position.x; }
          if(minY > position.y){ minY = position.y; }
          if(maxX < position.x){ maxX = position.x; }
          if(maxY < position.y){ maxY = position.y; }
        });

        boundary.x1 = minX
        boundary.x2 = maxX
        boundary.y1 = minY
        boundary.y2 = maxY

        return boundary
      }

      scope.$watch('boundaries()', function(newValue, oldValue){
        
        var width = boundary.x2 + margin - boundary.x1 + margin*2
        var height= boundary.y2 + margin - boundary.y1 + margin*2
        var wScale = mapSize / width
        var hScale = mapSize / height
        var scale = Math.min(wScale, hScale);
        scope.scale = scale
        graphX = -boundary.x1 + margin
        graphY = -boundary.y1 + margin
        scope.transform = "scale("+ scale +") translate("+ graphX + "px, "+ graphY +"px)";
        viewbox.css({
          borderWidth: 1/scale+"px"
        })
      }, true);
    }
}));

