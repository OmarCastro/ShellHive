import * as app from "../../app.module"
import { CSRF } from "../../services/csrf"
import { Graph } from "../../../graph"
import { ViewTransform } from "../../../math"
import { ConnectorPathMaker } from "../../services/connector-path-maker"
import * as angular from "angular";

export interface GraphController {
  mapPointToScene: (x: number, y: number) => IPoint
  mapMouseToScene: (event: MouseEvent) => IPoint
  mapMouseToView: (event: MouseEvent) => IPoint
  showPopup: (event, startNode: number, startPort: string, endNode: number, endPort: string) => void
  hidePopup: () => void
  hidePopupAndEdge: () => void
  endEdge: () => void
  isOutputPort: (port: string) => boolean
  updateLater: () => void
  scaleGraph: (amount: number) => void
  startEdge: (elem: HTMLElement, type, port, position, ev) => void
  scaleFromMouse(amount: number, event),
  moveEdge: (ev) => void
  isFreeSpace(elem: HTMLElement)
  translateGraphXY(x: number, y: number)
  moveScene(x: number, y: number)
  translateNode(id, position: IPoint, x: number, y: number)
}

export interface GraphControllerScope extends angular.IScope {
  visualData: jsmodels.IGraphData
  sel: any
  graphModel: any
  graphData: jsmodels.IGraphData
  options: any
  viewGraph: any
  graphElement: any
  shell: any
  toNatNum: any
  newCommandAtTopLeft: any
  graph: GraphController;
  isRootView: () => boolean
  macroViewList: () => any[]
  swapPrevious: any
  transformScale: any
  collapseAll: () => void
  uncollapseAll: () => void
  toggleShell: () => void
}

app.controller("graphCtrl", ['$scope', '$element', function (scope: GraphControllerScope, element) {
  let pointerId = 0;
  const transformation: ViewTransform = new ViewTransform(0, 0, 1);
  const elem = element[0];
  const nodesElem = elem.querySelector(".nodes");
  const nodesElemStyle = nodesElem.style;
  const edgesElem = elem.querySelector(".edges");
  const edgesElemStyle = edgesElem.style;
  const svgElem = elem.querySelector("svg");
  const $svgElem = $(svgElem);
  const workspace = elem.querySelector(".workspace");
  const $workspace = $(workspace);

  const toplayout = elem.querySelector(".toplayout");
  const splitbar = elem.querySelector(".ui-splitbar");
  const graphModel = scope.graphModel = scope.graphData;

  const _this = this as GraphController
  this.nodesElement = nodesElem;
  this.newCommandComponent = newCommandComponent;

  _this.startEdge = startEdge;
  _this.moveEdge = moveEdge;
  _this.endEdge = endEdge;
  _this.translateGraphXY = function (x: number, y: number) {
    transformation.translate(x, y)
    update();
  };

  _this.moveScene = moveScene;

  _this.updateLater = updateLater,
    _this.scaleGraph = scaleGraph
  _this.hidePopup = hidePopup;
  _this.showPopup = showPopup;
  _this.hidePopupAndEdge = hidePopupAndEdge;
  _this.mapPointToScene = mapPointToScene;
  _this.mapMouseToScene = mapMouseToScene;
  _this.mapMouseToView = mapMouseToView;
  _this.scaleFromMouse = scaleFromMouse;

  _this.isOutputPort = function (port) {
    return port === 'output' || port === 'error' || port === 'retcode';
  }


  _this.isFreeSpace = function (elem: HTMLElement) {
    return elem === svgElem || elem === workspace || elem === nodesElem;
  };

  function updateLater() {
    requestAnimationFrame(update)
  };


  this.setSelection = function (options, obj:JQuery ) {
    scope.sel = options;
    options.open = true;
    const elem = obj[0];
    const offset = obj.offset();
    const y = offset.top - 50 + elem.offsetHeight * transformation.scale;
    const x = offset.left;
    options.transform = "translate(" + x + "px, " + y + "px)";
  };

  this.selectSelection = function (value) {
    const options = scope.options;
    const sel = scope.sel;
    const data = sel.data;
    const name = sel.name;
    const currSelector = data.selectors[name];
    const toChange = options[data.exec].$selector[name][value];
    currSelector.name = toChange.name
    currSelector.type = toChange.type
    if (currSelector.value && toChange.type === "option") {
      delete currSelector.value
    } else if (!currSelector.value && toChange.type !== "option" && toChange.defaultValue) {
      currSelector.value = toChange.defaultValue
    }
    console.log('updateComponent', data);
    scope.$emit('updateComponent', data)
    sel.open = false;
  };
  this.removeComponent = function (component) {
    scope.visualData.removeComponent(component);
    CSRF.printget({ type: 'remove component', componentId: component.id });
  };

  this.getVisualData = function () {
    return scope.visualData;
  };
  this.setGraphView = function (viewId) {
    hidePopupAndEdge();
    scope.viewGraph(viewId);
  };
  this.revertToRoot = function () {
    scope.visualData = graphModel;
  };
  this.translateNode = function (id, position, x, y) {
    position.x += x / transformation.scale;
    position.y += y / transformation.scale;
    scope.$broadcast("Graph::Component::Moved", { id });
  };

  scope.graphElement = element

  scope.toNatNum = function (num) { return num.replace(/[^\d]/, '') };
  scope.graph = this;
  scope.$watch("shell", function () {
    if (!scope.shell) {
      toplayout.style.bottom = "0";
      return splitbar.style.display = "none";
    } else {
      toplayout.style.bottom = (100 - parseFloat(splitbar.style.top)) + "%";
      return splitbar.style.display = "";
    }
  });
  scope.visualData = scope.graphModel;
  scope.isRootView = function () { return scope.visualData == scope.graphModel };
  scope.macroViewList = function () {
    return (scope.visualData == scope.graphModel) ? graphModel.macroList : []
  }
  scope.swapPrevious = function (array: any[], index: number, id) {
    if (index === 0) { return; }
    const ref$ = [array[index - 1], array[index]];
    array[index] = ref$[0],
      array[index - 1] = ref$[1];

    const results = [];
    scope.visualData.connections.forEach((connection) => {
      if (connection.endNode === id) {
        if (connection.endPort === "file" + index) {
          results.push(connection.endPort = "file" + (index - 1));
        } else if (connection.endPort === "file" + (index - 1)) {
          results.push(connection.endPort = "file" + index);
        }
      }
    })
    return results;
  };

  function update() {
    nodesElemStyle.transform = transformation.cssTransform;
    edgesElemStyle.transform = transformation.cssTransform;
    scope.$broadcast("Graph::Minimap::UpdateViewPort", {
      topLeft: transformation.inverseTransformCoordinates(0, 0),
      bottomRight: transformation.inverseTransformCoordinates(nodesElem.offsetWidth, nodesElem.offsetHeight)
    })
  };

  function moveScene(x: number, y: number) {
    transformation.x = x * transformation.scale;
    transformation.y = y * transformation.scale;
    update();
  };

  function showPopup(event, startNode: number, startPort: string, endNode: number, endPort: string) {
    scope.$broadcast("createComponentPopup::show", event, startNode, startPort, endNode, endPort);
  }

  function newCommandComponent(command, position) {
    scope.$emit('addComponent', {})
  };


  function mapMouseToScene(event: MouseEvent): IPoint {
    const {x, y} = mapMouseToView(event);
    return mapPointToScene(x, y);
  };

  function mapMouseToView(event: MouseEvent): IPoint {
    const offset = $workspace.offset();
    return {
      x: Math.round(event.pageX - offset.left),
      y: Math.round(event.pageY - offset.top)
    };
  };

  function mapPointToScene(x: number, y: number): IPoint {
    return transformation.inverseTransformCoordinates(x, y)
  };

  function scaleGraph(amount: number) {
    if ((transformation.scale < 0.2 && amount < 1) || (transformation.scale > 20 && amount > 1)) {
      return;
    }
    const newScale = transformation.scale * amount
    if (newScale > 0.9 && newScale < 1.1) {
      transformation.scale = 1;
    } else transformation.scale *= amount;
  }

  function scaleFromMouse(amount, event) {
    if ((transformation.scale < 0.2 && amount < 1) || (transformation.scale > 20 && amount > 1)) {
      return;
    }
    hidePopupAndEdge();
    const newScale = transformation.scale * amount
    if (newScale > 0.9 && newScale < 1.1) {
      amount = 1 / transformation.scale;
    }

    const {x, y} = mapMouseToView(event);
    const relativeX = x - transformation.x;
    const relativeY = y - transformation.y;
    transformation.x += Math.round(-relativeX * amount + relativeX);
    transformation.y += Math.round(-relativeY * amount + relativeY);
    transformation.scale *= amount;
    update();
  };

  function hidePopup() {
    scope.$broadcast("createComponentPopup::hide");
    scope.$broadcast("Graph::Popup::CloseEdgePopup");
    (document.activeElement as HTMLElement).blur();
    scope.sel = { open: false };
    scope.$applyAsync();
  };

  function hidePopupAndEdge() { hidePopup(); endEdge(); };

  scope.newCommandAtTopLeft = function (command, event) {
    scope.$emit("addComponent", {
      command: command,
      position: mapPointToScene(0, 0)
    })
  };

  scope.collapseAll = function () {
    scope.$broadcast("Graph::Component::Collapse");
    requestAnimationFrame(resetConnections)
  }

  scope.uncollapseAll = function () {
    scope.$broadcast("Graph::Component::Uncollapse");
    requestAnimationFrame(resetConnections)
  }

  scope.transformScale = function () {
    return transformation.scale;
  }

  scope.toggleShell = function () {
    scope.shell = !scope.shell
    if (scope.shell)
      scope.$emit('compileGraph')
  }

  function resetConnections() {
    scope.$broadcast("Graph::Connector::Reset");
  }

  //edge
  const simpleEdge = element.find('.emptyEdge')[0];
  const edgeStartPosition: IPoint = { x: 0, y: 0 };

  function setEdgePath(edgeInitialPosition: IPoint, edgeEndPosition: IPoint) {
    const path = ConnectorPathMaker.makePath(edgeInitialPosition, edgeEndPosition)
    return simpleEdge.setAttribute('d', path);
  };

  function startEdge(elem, type, port, position: IPoint) {
    hidePopup();
    elem = elem.querySelector(".box") || elem;
    simpleEdge.setAttribute("class", "emptyEdge from-" + type + "-" + port + " from-" + type)
    edgeStartPosition.x = elem.offsetLeft + position.x;
    edgeStartPosition.y = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
    return setEdgePath(edgeStartPosition, edgeStartPosition);
  };

  function moveEdge(event) {
    return setEdgePath(edgeStartPosition, mapMouseToScene(event));
  };

  function endEdge() {
    return simpleEdge.setAttribute('d', "M 0 0");
  };

}
]);