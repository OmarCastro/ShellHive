import * as app from "../../app.module"
import * as angular from "angular"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import { Graph, Connection } from "../../../graph"
import { GraphController } from "../graph/graph.controller"
import template = require("./minimap.html")

interface Boundary {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface MinimapScope extends angular.IScope {
  graphElement: JQuery
  scale: number
  mapSize: number
  viewport: any
  transform: string
  boundaries: () => {}
  visualData: Graph
}

app.directive("minimap", () => ({
  scope: true,
  require: '^graph',
  template: template,
  link: function (scope: MinimapScope, element, attr, graphController: GraphController) {
    const workspace = element.closest("[graph]").find(".workspace")[0] as HTMLElement;
    const elem = element[0];
    const viewbox = element.find(".viewbox");
    const mapSize = 150;
    const margin = 200 //margin to view all nodes

    const boundary: Boundary = {x1:0,x2:0,y1:0,y2:0};
    let graphX = 0
    let graphY = 0
    scope.mapSize = mapSize;
    scope.scale = 1;

    elem.style.width = mapSize + "px"
    elem.style.height = mapSize + "px"

    scope.$on("Graph::Minimap::UpdateViewPort", (event, viewport) => updateViewport(viewport));

    function updateViewport(viewport: IViewBox) {
      const scale = scope.scale;
      const {topLeft, bottomRight} = viewport
      viewbox.css({
        transform: "translate(" + (-topLeft.x) + "px, " + (-topLeft.y) + "px)",
        width: (bottomRight.x - topLeft.x),
        height: (bottomRight.y - topLeft.y),
        borderWidth: 1 / scale + "px"
      })
    }
    requestAnimationFrame(() => updateViewport({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: workspace.offsetWidth, y: workspace.offsetHeight }
    })
    );

    function mapMouseToScene(event) {
      const {x, y} = mapMouseToView(event);
      return mapPointToScene(x, y);
    };

    function mapMouseToView(event) {
      const offset = element.offset();
      return {
        x: Math.round(event.pageX - offset.left),
        y: Math.round(event.pageY - offset.top)
      };
    };

    function mapPointToScene(x, y) {
      const scale = scope.scale;
      return {
        x: (x / scale - graphX),
        y: (y / scale - graphY)
      };
    };

    function pointerEvent(ev) {
      const event = ev.originalEvent
      const viewport = scope.viewport;
      const point = mapMouseToScene(event)
      const width = (viewport.x2 - viewport.x1)
      const height = (viewport.y2 - viewport.y1)
      const midX = width / 2;
      const midY = height / 2;
      const newX = (point.x - midX)
      const newY = (point.y - midY)
      graphController.moveScene(-newX, -newY);
      event.preventDefault();
      event.stopPropagation();
    }

    element.bind("pointerdown", function (ev) { pointerEvent(ev); element.bind("pointermove", pointerEvent); });
    element.bind("pointerup", function (ev) { element.unbind("pointermove", pointerEvent); });


    const mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
    elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
    function MouseWheelHandler(event) {
      event.preventDefault();
      event.stopPropagation();
    };

    function isBoundaryEqual(b1: Boundary, b2: Boundary) {

      return b1.x1 === b2.x1 && b1.x2 === b2.x2 && b1.y1 === b2.y1 && b1.y2 === b2.y2;
    }

    function getBoundary(): Boundary {
      const components = scope.visualData.components;
      if (!components || components.length == 0) return null;
      const firstComponentPosition = components[0].position
      let minX = firstComponentPosition.x;
      let minY = firstComponentPosition.y;
      let maxX = firstComponentPosition.x;
      let maxY = firstComponentPosition.y;
      for (let i = components.length - 1; i > 0; --i) {
        const {x, y} = components[i].position;
        if (minX > x) { minX = x; }
        if (minY > y) { minY = y; }
        if (maxX < x) { maxX = x; }
        if (maxY < y) { maxY = y; }
      }
      return { x1: minX, x2: maxX, y1: minY, y2: maxY }
    }

    function updateBoundaries() {
      const newBoundary = getBoundary();
      if (!newBoundary || isBoundaryEqual(boundary, newBoundary)) return;
      angular.extend(boundary, newBoundary);
      handleBoundaryChanges();
    }

    scope.$on("Graph::Component::Moved", () => scope.$applyAsync());


    function handleBoundaryChanges() {
      console.log("boundariesChanged()");
      const width = boundary.x2 + margin - boundary.x1 + margin * 2;
      const height = boundary.y2 + margin - boundary.y1 + margin * 2;
      const wScale = mapSize / width;
      const hScale = mapSize / height;
      const scale = Math.min(wScale, hScale);
      scope.scale = scale;
      graphX = -boundary.x1 + margin;
      graphY = -boundary.y1 + margin;
      scope.transform = `scale(${scale}) translate(${graphX}px, ${graphY}px)`;
      viewbox.css({
        borderWidth: 1 / scale + "px"
      });
      scope.$applyAsync();
    }

    scope.$watchCollection("visualData.components", () => updateBoundaries())
    scope.$on("Graph::Component::Moved", () => updateBoundaries());
  }
}));

