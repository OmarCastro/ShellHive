import * as app from "../../app.module"
import { CSRF } from "../../services/csrf"
import { Graph } from "../../../graph"
import { ViewTransform } from "../../../math"
import { ConnectorPathMaker } from "../../services/connector-path-maker"
import network, { routeTable } from "../../router"
import * as angular from "angular";

export interface GraphControllerScope extends angular.IScope {
  visualData: jsmodels.IGraphData
  sel: any
  graphModel: any
  graphData: jsmodels.IGraphData
  options: any
  viewGraph: any
  graphElement: any
  shell: any
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


export class GraphController {
  private pointerId = 0;
  private readonly transformation: ViewTransform = new ViewTransform(0, 0, 1);
  private nodesElement: HTMLElement;
  private svgElem: SVGElement
  private workspace: HTMLElement
  private edgesElem: HTMLElement
  private $workspace: JQuery
  private readonly graphModel: any
  private simpleEdge: HTMLElement;
  private edgeStartPosition: IPoint = { x: 0, y: 0 };



  static $inject = ['$scope', '$element']
  constructor(
    private scope: GraphControllerScope,
    element: angular.IRootElementService
  ) {

    const elem = element[0];
    this.nodesElement = elem.querySelector(".nodes") as HTMLElement;
    this.edgesElem = elem.querySelector(".edges") as HTMLElement;
    this.svgElem = elem.querySelector("svg");
    this.workspace = elem.querySelector(".workspace") as HTMLElement;
    this.$workspace = $(this.workspace);
    const toplayout = elem.querySelector(".toplayout") as HTMLElement;
    const splitbar = elem.querySelector(".ui-splitbar") as HTMLElement;
    this.graphModel = scope.graphModel = scope.graphData;
    scope.graphElement = element

    this.simpleEdge = element.find('.emptyEdge')[0] as HTMLElement;
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
      return (scope.visualData == scope.graphModel) ? this.graphModel.macroList : []
    }.bind(this);



    scope.collapseAll = function () {
      scope.$broadcast("Graph::Component::Collapse");
      requestAnimationFrame(this.resetConnections)
    }.bind(this);

    scope.uncollapseAll = function () {
      scope.$broadcast("Graph::Component::Uncollapse");
      requestAnimationFrame(this.resetConnections)
    }.bind(this);

    scope.transformScale = function () {
      return this.transformation.scale;
    }.bind(this);

    scope.toggleShell = function () {
      scope.shell = !scope.shell
      if (scope.shell)
        scope.$emit('compileGraph')
    }.bind(this);

  }

  newCommandAtTopLeft(command: string) {
    this.createCommandComponent({
      command: command,
      position: this.mapPointToScene(0, 0)
    });
  }

  createCommandComponent(params: ICreateComponentParams) {
    network.send({
      payload: params,
      useRoute: routeTable.createComponent()
    })
  }


  translateGraphXY(x: number, y: number) {
    this.transformation.translate(x, y)
    this.update();
  };

  isOutputPort(port) {
    return port === 'output' || port === 'error' || port === 'retcode';
  }

  isFreeSpace(elem: Element) {
    return elem === this.svgElem || elem === this.workspace || elem === this.nodesElement;
  }

  updateLater() {
    requestAnimationFrame(this.update.bind(this))
  }

  setSelection(options, obj: JQuery) {
    this.scope.sel = options;
    options.open = true;
    const elem = obj[0];
    const offset = obj.offset();
    const y = offset.top - 50 + elem.offsetHeight * this.transformation.scale;
    const x = offset.left;
    options.transform = "translate(" + x + "px, " + y + "px)";
  }

  selectSelection(value) {
    const {options, sel} = this.scope;
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
    this.scope.$emit('updateComponent', data)
    sel.open = false;
  }

  removeComponent = function (component) {
    this.scope.visualData.removeComponent(component);
    CSRF.printget({ type: 'remove component', componentId: component.id });
  }

  getVisualData() {
    return this.scope.visualData;
  }

  setGraphView = function (viewId) {
    this.hidePopupAndEdge();
    this.scope.viewGraph(viewId);
  };
  revertToRoot = function () {
    this.scope.visualData = this.graphModel;
  };

  translateNode = function (id, position, x, y) {
    const {scope, transformation} = this
    position.x += x / transformation.scale;
    position.y += y / transformation.scale;
    scope.$broadcast("Graph::Component::Moved", { id });
  };

  update() {
    const {nodesElement, edgesElem, scope, transformation} = this
    nodesElement.style.transform = this.transformation.cssTransform;
    edgesElem.style.transform = this.transformation.cssTransform;
    scope.$broadcast("Graph::Minimap::UpdateViewPort", {
      topLeft: transformation.inverseTransformCoordinates(0, 0),
      bottomRight: transformation.inverseTransformCoordinates(nodesElement.offsetWidth, nodesElement.offsetHeight)
    })
  };

  moveScene(x: number, y: number) {
    const {update, transformation} = this
    transformation.x = x * transformation.scale;
    transformation.y = y * transformation.scale;
    update.apply(this);
  };

  showPopup(event, startNode: number, startPort: string, endNode: number, endPort: string) {
    this.scope.$broadcast("createComponentPopup::show", event, startNode, startPort, endNode, endPort);
  }


  mapMouseToScene(event: MouseEvent): IPoint {
    const {x, y} = this.mapMouseToView(event);
    return this.mapPointToScene(x, y);
  };

  mapMouseToView(event: MouseEvent): IPoint {
    const offset = this.$workspace.offset();
    return {
      x: Math.round(event.pageX - offset.left),
      y: Math.round(event.pageY - offset.top)
    };
  };

  mapPointToScene(x: number, y: number): IPoint {
    return this.transformation.inverseTransformCoordinates(x, y)
  };



  scaleGraph(amount: number) {
    const {transformation} = this
    if ((transformation.scale < 0.2 && amount < 1) || (transformation.scale > 20 && amount > 1)) {
      return;
    }
    const newScale = transformation.scale * amount
    if (newScale > 0.9 && newScale < 1.1) {
      transformation.scale = 1;
    } else transformation.scale *= amount;
  }

  scaleFromMouse(amount, event) {
    const {transformation} = this
    if ((transformation.scale < 0.2 && amount < 1) || (transformation.scale > 20 && amount > 1)) {
      return;
    }
    this.hidePopupAndEdge();
    const newScale = transformation.scale * amount
    if (newScale > 0.9 && newScale < 1.1) {
      amount = 1 / transformation.scale;
    }

    const {x, y} = this.mapMouseToView(event);
    const relativeX = x - transformation.x;
    const relativeY = y - transformation.y;
    transformation.x += Math.round(-relativeX * amount + relativeX);
    transformation.y += Math.round(-relativeY * amount + relativeY);
    transformation.scale *= amount;
    this.update();
  };

  hidePopup() {
    const {scope} = this
    scope.$broadcast("createComponentPopup::hide");
    scope.$broadcast("Graph::Popup::CloseEdgePopup");
    (document.activeElement as HTMLElement).blur();
    scope.sel = { open: false };
    scope.$applyAsync();
  };

  hidePopupAndEdge() {
    this.hidePopup();
    this.endEdge();
  };

  resetConnections() {
    this.scope.$broadcast("Graph::Connector::Reset");
  }


  //edge


  setEdgePath(edgeInitialPosition: IPoint, edgeEndPosition: IPoint) {
    const path = ConnectorPathMaker.makePath(edgeInitialPosition, edgeEndPosition)
    return this.simpleEdge.setAttribute('d', path);
  };

  startEdge(elem, type, port, position: IPoint) {
    const {simpleEdge, edgeStartPosition} = this
    this.hidePopup();
    elem = elem.querySelector(".box") || elem;
    simpleEdge.setAttribute("class", "emptyEdge from-" + type + "-" + port + " from-" + type)
    edgeStartPosition.x = elem.offsetLeft + position.x;
    edgeStartPosition.y = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
    this.setEdgePath(edgeStartPosition, edgeStartPosition);
  };

  moveEdge(event) {
    this.setEdgePath(this.edgeStartPosition, this.mapMouseToScene(event));
  };

  endEdge() {
    this.simpleEdge.setAttribute('d', "M 0 0");
  };


  swapPrevious(array: any[], index: number, id) {
    if (index === 0) { return; }
    const ref$ = [array[index - 1], array[index]];
    array[index] = ref$[0];
    array[index - 1] = ref$[1];
    const results = [];
    this.scope.visualData.connections.forEach((connection) => {
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

}
app.controller("graphCtrl", GraphController);