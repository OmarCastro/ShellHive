import * as app from "../../app.module"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import { ConnectorPathMaker } from "../../services/connector-path-maker"
import { GraphControllerScope } from "../graph/graph.controller"



import router from "../../router"


import { Graph, Connection } from "../../../graph"

interface ConnectorsScope extends GraphControllerScope {
  edge: Connection
  endsPositions: Point[]
  $index: number
}

app.directive("connector", ['$timeout','$rootScope', ($timeout, $rootScope: angular.IRootScopeService) => ({
  scope: true,
  restrict: "A",
  link: function (scope: ConnectorsScope, element, attr) {
    const StartPortOffset = { top: 0, left: 0, right: 0, isNull: true };
    const EndPortOffset = { top: 0, left: 0, isNull: true };

    const dataedge: Connection = scope.edge;
    const elem = element[0];
    const $graphElement = scope.graphElement;
    const graphElement = $graphElement[0];


    const startComponent = dataedge.startComponent;
    const startPosition = startComponent.position;
    const endComponent = dataedge.endComponent;
    const endPosition = endComponent.position;
    scope.endsPositions = [startPosition, endPosition]

    function queryConnectorInfo() {
      //console.log("queryConnectorInfo")
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

    function update(startPos?: Point, endPos?: Point) {
      if (StartPortOffset.isNull || EndPortOffset.isNull) {
        queryConnectorInfo();
      }
      if (startPos) {
        startPosition.x = startPos.x;
        startPosition.y = startPos.y;
      }
      if (endPos) {
        endPosition.x = endPos.x;
        endPosition.y = endPos.y;
      }

      setEdgePath(startPosition.x + StartPortOffset.right - 2,
        startPosition.y + StartPortOffset.top,
        endPosition.x + EndPortOffset.left + 2,
        endPosition.y + EndPortOffset.top);
    };

    const elementClass = "from-" + startComponent.type;
    elem.classList.add(elementClass);
    elem.classList.add(elementClass + "-" + dataedge.startPort);

    element.bind("pointerdown", function (event) {
      const x = event.clientX
      const y = event.clientY
      $rootScope.$broadcast("Graph::Popup::SetEdgePopup", {x,y}, dataedge.id, scope.$index)
    });

    function setEdgePath(iniX, iniY, endX, endY) {
      elem.setAttribute('d', ConnectorPathMaker.makePath({x:iniX, y:iniY}, {x:endX, y:endY}));
    };

    scope.$on("Graph::Connector::Reset", () => reset())
    scope.$on("Graph::Connector::ResetOfComponent", (event, componentId) => {
      if (scope.edge.startNode == componentId || scope.edge.endNode == componentId) reset()
    })
    scope.$on("Graph::Connector::Update", (event, params) => update(params.startPos, params.endPos))
    scope.$on("Graph::Connector::UpdateOfComponent", (event, componentId, position) => {
      if (scope.edge && scope.edge.startNode === componentId) {
        update(position);
      } else if (scope.edge && scope.edge.endNode === componentId) {
        update(null, position);
      }

    })

    function reset() {
      queryConnectorInfo();
      update();
    };

    $timeout(function () {
      scope.$watch('edge.endPort', reset);
      requestAnimationFrame(reset)
    });
  }
})]);
