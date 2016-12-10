import * as app from "../app.module"
import { projectId } from "../utils"
import { SocketService } from "../socket.service"
import router from "../router"
import { Graph, Connection } from "../../graph"
import { Position, Boundary } from "../../math"
import { ConnectorsScope } from "../directives/connector.directive"
import { CSRF } from "../services/csrf"

interface MiniComponentScope extends angular.IScope{
  graphElement: JQuery
  data: any
  offsetWidth: number
  offsetHeight:number
}

app.directive("minicomponent", function(){
  return {
    scope: true,
    link: function(scope: MiniComponentScope, element, attr){
      var datanode = scope.data;
      var $graphElement = scope.graphElement;
      var graphElement = $graphElement[0];

      scope.offsetWidth = 100
      scope.offsetHeight = 100

      var update = function(){
        var elem = graphElement.querySelector(".nodes .component[data-node-id='" + datanode.id + "']") as HTMLElement;
        scope.offsetWidth = (elem) ? elem.offsetWidth:100
        scope.offsetHeight = (elem) ? elem.offsetHeight:100
        scope.$digest();
      }

      if(datanode.files !== null){
        scope.$watch("data.files.length",function(){
          requestAnimationFrame(update);
        })
      }

      scope.$watch("data",function(){
        requestAnimationFrame(update);
      })
      requestAnimationFrame(update);
    }
  }
});
