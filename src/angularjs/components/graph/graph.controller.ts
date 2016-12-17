import * as app from "../../app.module"
import {CSRF} from "../../services/csrf"
import {MinimapScope} from "../minimap/minimap.directive"
import * as angular from "angular";

export interface GraphController {
  mapPointToScene: (x: number, y: number) => IPoint
  mapMouseToScene: (event: MouseEvent) => IPoint
  mapMouseToView: (event: MouseEvent) => IPoint
  showPopup: (event, startNode: number, startPort: string, endNode: number, endPort:string) => void
  hidePopup: () => void
  hidePopupAndEdge: () => void
  endEdge: () => void
  isOutputPort: (port : string) => boolean
}

app.controller("graphCtrl", ['$scope', '$element', '$attrs', '$document', function(scope, element, attr, $document){
        var key, val, x$, $sp, update, mousemove, scaleFromMouse, useWheelHandler, setEdgePath;
        
        const mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";


        var pointerId = 0;
        var scale = 1;
        var graphX = 0;
        var graphY = 0;
        var startX = 0;
        var startY = 0;
        var edgeIniX = 0;
        var edgeIniY = 0;
        var elem = element[0];
        var nodesElem = elem.querySelector(".nodes");
        var nodesElemStyle = nodesElem.style;
        var edgesElem = elem.querySelector(".edges");
        var edgesElemStyle = edgesElem.style;
        var svgElem = elem.querySelector("svg");
        var $svgElem = $(svgElem);
        var workspace = elem.querySelector(".workspace");
        var $workspace = $(workspace);

        var minimap = elem.querySelector("[minimap]");
        var $minimap = $(minimap);
        var toplayout = elem.querySelector(".toplayout");
        var splitbar = elem.querySelector(".ui-splitbar");
        var graphModel = scope.graphModel = scope.graphData;       
      

        scope.edgePopups = [];

        scope.graphElement = element
        scope.safedigest = function(){
          if (!(scope.$$phase || scope.$root.$$phase)) {
            scope.$digest();
          }
        };
        scope.toNatNum = function(num){ return num.replace(/[^\d]/, '') };
        scope.popupText = '';
        scope.graph = this;
        scope.$watch("shell", function(){
          if (!scope.shell) {
            toplayout.style.bottom = "0";
            return splitbar.style.display = "none";
          } else {
            toplayout.style.bottom = (100 - parseFloat(splitbar.style.top)) + "%";
            return splitbar.style.display = "";
          }
        });
        scope.visualData = scope.graphModel;
        scope.isArray = angular.isArray;
        scope.isString = angular.isString;
        scope.isRootView = function(){  return scope.visualData == scope.graphModel };
        scope.macroViewList = function(){ return ( scope.visualData == scope.graphModel ) ? graphModel.macroList : [] }
        scope.swapPrevious = function(array, index, id){
          var ref$, i$, len$, connection, results$ = [];
          if (index === 0) {
            return;
          }


          ref$ = [array[index - 1], array[index]],  array[index] = ref$[0], array[index - 1] = ref$[1];
          for(var i = 0, _ref=scope.visualData.connections, length=_ref.length;i<length;++i){
            var connection = _ref[i];
            if (connection.endNode === id) {
              if (connection.endPort === "file" + index) {
                results$.push(connection.endPort = "file" + (index - 1));
              } else if (connection.endPort ===  "file" + (index - 1)) {
                results$.push(connection.endPort = "file" + index);
              }
            }
          }
          return results$;
        };
        update = function(){
          var transform;
          transform = "translate(" + graphX + "px, " + graphY + "px) scale(" + scale + ")";
          nodesElemStyle.transform = transform;
          edgesElemStyle.transform = transform;
          var scope = $minimap.scope() as MinimapScope
           scope.updateViewport({
            x1: graphX/scale,
            y1: graphY/scale,
            x2: (graphX + nodesElem.offsetWidth)/scale,
            y2: (graphY + nodesElem.offsetHeight)/scale
          });
        };

        mousemove = function(ev){
          var event = ev.originalEvent;
          graphX += event.screenX - startX;
          graphY += event.screenY - startY;
          startX = event.screenX;
          startY = event.screenY;
          update();
        };

        function moveScene(x, y){
          graphX = x*scale;
          graphY = y*scale;
          update();
        };

        function mouseup(){
          pointerId = 0;
          $document.unbind("pointermove", mousemove);
          $document.unbind("pointerup", mouseup);
        };

        $workspace.bind("contextmenu", function(ev: JQueryEventObject){
            if (ev.shiftKey) { return; }
            ev.preventDefault();
            ev.stopPropagation();
            showPopup(ev, null, null, null, null);
        })

        function showPopup(event, startNode: number, startPort: string, endNode: number, endPort: string){
           scope.$broadcast("createComponentPopup::show",event, startNode, startPort, endNode, endPort );
        }

        $workspace.bind("pointerdown", function(ev: any){
          console.log(ev);
          var event = ev.originalEvent;
          if (ev.which === 3) {
            return false;
          }
          var targetTag = (event.target as HTMLElement).tagName;
          if (pointerId || 
            (  targetTag === 'SPAN' 
            || targetTag === 'LI'
            || targetTag === 'INPUT'
            || targetTag === 'SELECT' 
            || targetTag === 'LABEL' 
            || targetTag === 'BUTTON' 
            || targetTag === 'A' 
            || targetTag === 'TEXTAREA')) {
            return;
          }
          hidePopupAndEdge();
          var mx = ev.clientX
          var my = ev.clientY
          $workspace.hide()
          var elonpointer = document.elementFromPoint(mx, my)
          $workspace.show()
          console.log("tagname", elonpointer.tagName);
          if(elonpointer.tagName == "path"){
            event.preventDefault();
            event.stopPropagation();
            return $(elonpointer).trigger(ev)
          }

          pointerId = event.pointerId;
          $document.bind("pointermove", mousemove);
          
          $document.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });

        function newCommandComponent(command, position){
          scope.$emit('addComponent', {})
        };


        function mapMouseToScene(event: MouseEvent):IPoint{
          const {x, y} = mapMouseToView(event);
          return mapPointToScene(x, y);
        };

        function mapMouseToView(event: MouseEvent):IPoint{
          const offset = $workspace.offset();
          return {
            x: Math.round(event.pageX - offset.left),
            y: Math.round(event.pageY - offset.top)
          };
        };

        function mapPointToScene(x: number, y: number):IPoint{
          return {
            x: (x - graphX) / scale,
            y: (y - graphY) / scale
          };
        };

        function scaleGraph(amount){
          if ((scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)) {
            return;
          }
          var newScale = scale * amount
          if(newScale > 0.9 && newScale < 1.1){
            scale = 1;
          } else scale *= amount;
        }

        scaleFromMouse = function(amount, event){
          var ref$, x, y, relpointX, relpointY;
          if ((scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)) {
            return;
          }
          hidePopupAndEdge();
          var newScale = scale * amount
          if(newScale > 0.9 && newScale < 1.1){
            amount = 1/scale;
          }

          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          relpointX = x - graphX;
          relpointY = y - graphY;
          graphX += Math.round(-relpointX * amount + relpointX);
          graphY += Math.round(-relpointY * amount + relpointY);
          scale *= amount;
          update();
        };
        function MouseWheelHandler(event){
          var ispopup = $(event.target).closest(".popupArea, .shell").length > 0
          if (!event.altKey && ispopup) { return; }
          event.preventDefault();
          event.stopPropagation();
          if ((event.wheelDelta || -event.detail) > 0) {
            return scaleFromMouse(1.1, event);
          } else {
            return scaleFromMouse(0.9, event);
          }
        };
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
        var simpleEdge = element.find('.emptyEdge')[0];

        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return simpleEdge.setAttribute(
            'd', "M " + iniX + " " + iniY + 
                " H " + (iniX + 0.5 * xpoint) + 
                " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY +
                " H " + endX);
        };
        function startEdge(elem, type, port , position, ev){
          hidePopup();
          elem = elem.querySelector(".box") || elem;
          simpleEdge.setAttribute("class", "emptyEdge from-"+type+"-"+port+" from-"+type)
          edgeIniX = elem.offsetLeft + position.x;
          edgeIniY = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
          return setEdgePath(edgeIniX, edgeIniY, edgeIniX, edgeIniY);
        };
        function moveEdge(event){
          const {x,y} = mapMouseToScene(event)
          return setEdgePath(edgeIniX, edgeIniY, x, y);
        };

        function endEdge(){
          return simpleEdge.setAttribute('d', "M 0 0");
        };



        function hidePopup(){
          scope.$broadcast("createComponentPopup::hide");
          (document.activeElement as HTMLElement).blur();
          scope.edgePopups.length = 0;
          scope.sel = { open: false };
          scope.safedigest();
        };
        
        function hidePopupAndEdge(){ hidePopup(); endEdge();   };

        scope.newCommandAtTopLeft = function(command,event){
          scope.$emit("addComponent",{
            command:command,
            position:mapPointToScene(0, 0)
          })
        };

        scope.collapseAll = function(){
          $('[component]').each(function(index){
            var scope = $(this).scope() as any;
            scope.collapsed = true
            scope.updatePorts();
            requestAnimationFrame(scope.resetConnections)
          })
        }

        scope.transformScale = function(){
          return scale;
        }



        scope.uncollapseAll = function(){
          $('[component]').each(function(index){
            var scope = $(this).scope() as any;
            scope.collapsed = false
            scope.updatePorts();
            requestAnimationFrame(scope.resetConnections)
          })
        }

        scope.toggleShell = function(){
          scope.shell = !scope.shell
          if(scope.shell)
          scope.$emit('compileGraph')
        }

        scope.resetConnections = function(){
            scope.$broadcast("Graph::Connector::Reset");
        }

        const _this = this as GraphController 
        this.nodesElement = nodesElem;
        this.newCommandComponent = newCommandComponent;
        this.startEdge = startEdge;
        this.moveEdge = moveEdge;
        this.moveScene = moveScene;
        _this.endEdge = endEdge;
        this.updateLater = function(){requestAnimationFrame(update)};
        this.scaleGraph = scaleGraph
        _this.hidePopup = hidePopup;
        _this.showPopup = showPopup;
        _this.hidePopupAndEdge = hidePopupAndEdge;
        _this.mapPointToScene = mapPointToScene;
        _this.mapMouseToScene = mapMouseToScene;
        _this.mapMouseToView = mapMouseToView;
        _this.isOutputPort = function(port){
          return port === 'output' || port === 'error' || port === 'retcode';
        }


        this.setSelection = function(options, obj){
          var elem, offset, position, y, x;
          scope.sel = options;
          options.open = true;
          elem = obj[0];
          offset = obj.offset();
          position = options.data.position;
          y = offset.top - 50 + elem.offsetHeight * scale;
          x = offset.left;
          options.transform = "translate(" + x + "px, " + y + "px)";
        };
        this.selectSelection = function(value){
          var options, sel, data, name;
          options = scope.options, sel = scope.sel;
          data = sel.data, name = sel.name;
          var currSelector = data.selectors[name];
          var toChange = options[data.exec].$selector[name][value];
          currSelector.name = toChange.name
          currSelector.type = toChange.type
          if(currSelector.value && toChange.type === "option"){
            delete currSelector.value
          } else if(!currSelector.value && toChange.type !== "option" && toChange.defaultValue){
            currSelector.value = toChange.defaultValue
          }
          console.log('updateComponent',data);
          scope.$emit('updateComponent',data)
          sel.open = false;
        };
        this.removeComponent = function(component){
          scope.visualData.removeComponent(component);
          CSRF.printget({type: 'remove component', componentId: component.id});
        };
        this.isFreeSpace = function(elem){
          return elem === svgElem || elem === workspace || elem === nodesElem;
        };
        this.updateScope = function(){
          return scope.$digest();
        };
        this.getVisualData = function(){
          return scope.visualData;
        };
        this.setGraphView = function(viewId){
          hidePopupAndEdge();
          scope.viewGraph(viewId);
        };
        this.revertToRoot = function(){
          scope.visualData = graphModel;
        };
        this.translateNode = function(id, position, x, y){
          position.x += x / scale;
          position.y += y / scale;
          scope.$digest();
        };
      }
    ]);