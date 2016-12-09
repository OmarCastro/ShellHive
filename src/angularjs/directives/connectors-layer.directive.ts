import * as app from "../app.module"
import { projectId } from "../utils"
import { Graph, Connection } from "../../graph"
import {SocketService} from "../socket.service"
import router from "../router"


app.directive("connectorsLayer", [function(){
  return {
    scope: true,
    restrict: "A",
    transclude: true,
    template: `
      <svg touch-action="none">
        <g class="edges">
          <path class="emptyEdge"></path>
          <path connector ng-repeat="edge in visualData.connections" class="back"></path>
          <path connector ng-repeat="edge in visualData.connections"></path>
        </g>
      </svg>`
  };
}]);
