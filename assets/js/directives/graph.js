app.directive("graph", function($document){
  return {
    replace: false,
    scope: true,
    templateUrl: 'graphTemplate.html',
    controller: ['$scope', '$element', '$attrs', function(scope, element, attr){
        var key, val, x$, $sp, update, mousemove, mouseup, newCommandComponent, mapMouseToScene, mapMouseToView, mapPointToScene, scaleFromMouse, 
        useWheelHandler, mousewheelevt, simpleEdge, setEdgePath, popupState, startEdge, moveEdge,
        endEdge, showPopup, hidePopup, hidePopupAndEdge;
        
        
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
        var popup = elem.querySelector(".popup");
        var $popup = $(popup);
        var popupHeight = $popup.find("form").height();
        var $popupInput = $popup.find("input");
        var toplayout = elem.querySelector(".toplayout");
        var splitbar = elem.querySelector(".ui-splitbar");
        var graphModel = scope.graphModel = scope.graphData;       
      
        $popup.hide();

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
          nodesElemStyle[cssTransform] = transform;
          return edgesElemStyle[cssTransform] = transform;
        };
        update();
        mousemove = function(ev){
          var event = ev.originalEvent;
          graphX += event.screenX - startX;
          graphY += event.screenY - startY;
          startX = event.screenX;
          startY = event.screenY;
          update();
        };
        mouseup = function(){
          pointerId = 0;
          $document.unbind("pointermove", mousemove);
          $document.unbind("pointerup", mouseup);
        };
        $workspace.bind("pointerdown", function(ev){
          if (ev.which === 3) {
            return false;
          }
          var event = ev.originalEvent;
          var targetTag = event.target.tagName;
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
          var mx = event.clientX
          var my = event.clientY
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

        newCommandComponent = function(command, position){
          scope.$emit('addComponent', {})
        };
        mapMouseToScene = function(event){
          var ref$, x, y;
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          return mapPointToScene(x, y);
        };
        mapMouseToView = function(event){
          var offset;
          offset = $workspace.offset();
          return {
            x: Math.round(event.pageX - offset.left),
            y: Math.round(event.pageY - offset.top)
          };
        };
        mapPointToScene = function(x, y){
          return {
            x: (x - graphX) / scale,
            y: (y - graphY) / scale
          };
        };
        scaleFromMouse = function(amount, event){
          var ref$, x, y, relpointX, relpointY;
          if ((scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)) {
            return;
          }
          hidePopupAndEdge();
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          relpointX = x - graphX;
          relpointY = y - graphY;
          graphX += Math.round(-relpointX * amount + relpointX);
          graphY += Math.round(-relpointY * amount + relpointY);
          scale *= amount;
          update();
        };
        MouseWheelHandler = function(event){
          if (!event.altKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if ((event.wheelDelta || -event.detail) > 0) {
            return scaleFromMouse(1.1, event);
          } else {
            return scaleFromMouse(0.9, event);
          }
        };
        mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
        simpleEdge = element.find('.emptyEdge')[0];
        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return simpleEdge.setAttribute(
            'd', "M " + iniX + " " + iniY + 
                " H " + (iniX + 0.5 * xpoint) + 
                " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY +
                " H " + endX);
        };
        popupState = {
          x: 0,
          y: 0,
          startNode: 0,
          startPort: 0
        };
        startEdge = function(elem, position, ev){
          this.hidePopup();
          edgeIniX = elem.offsetLeft + position.x;
          edgeIniY = elem.offsetTop + elem.offsetHeight * 0.75 + position.y;
          return setEdgePath(edgeIniX, edgeIniY, edgeIniX, edgeIniY);
        };
        moveEdge = function(event){
          var ref$, x, y;
          ref$ = mapMouseToScene(event), x = ref$.x, y = ref$.y;
          return setEdgePath(edgeIniX, edgeIniY, x, y);
        };
        endEdge = function(){
          return simpleEdge.setAttribute('d', "M 0 0");
        };
        showPopup = function(event, startNode, startPort, endNode, endPort){
          var ref$, x, y, x$;
          scope.popupText = '';
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          importAll$(popupState, {
            x: x,
            y: y
          });
          popupState.startNode = startNode;
          popupState.startPort = startPort;
          popupState.endNode = endNode;
          popupState.endPort = endPort;
          popup.style[cssTransform] = "translate(" + Math.round(x) + "px," + Math.round(y - popupHeight / 2) + "px)";
          $popup.show();
          $popupInput.focus();
          return scope.safedigest();
        };
        var popupSubmit = function(content){
          var comp;

          scope.$emit('addAndConnectComponent', {
            command: content,
            componentId: popupState.startNode,
            startPort: popupState.startPort,
            position: {x: popupState.x , y: popupState.y}
          })
          hidePopup();
          endEdge();
          
        };
        hidePopup = function(){
          $popup.hide();
          scope.sel = { open: false };
          scope.safedigest();
        };
        hidePopupAndEdge = function(){ hidePopup(); endEdge();   };

        scope.newCommandAtTopLeft = function(command,event){
          scope.$emit("addComponent",{
            command:command,
            position:mapPointToScene(0, 0)
          })
        };

        scope.collapseAll = function(){
          $('[component]').each(function(index){
            var scope = $(this).scope();
            scope.collapsed = true
            scope.updatePorts();
            requestAnimationFrame(scope.resetConnections)
          })
        }



        scope.uncollapseAll = function(){
          $('[component]').each(function(index){
            var scope = $(this).scope();
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
        Mousetrap.bind("ctrl+shift+up", function(){scope.$apply(scope.collapseAll)});
        Mousetrap.bind("alt+a", function(){scope.$apply(scope.collapseAll)});
        Mousetrap.bind("alt+s", function(){scope.$apply(scope.toggleShell)});
        Mousetrap.bind("ctrl+shift+down", function(){scope.$apply(scope.uncollapseAll)});


        scope.resetConnections = function(){
          $('path[connector]').each(function(index){ $(this).scope().reset() });
        }

        this.showPopup = showPopup;
        this.popupSubmit = popupSubmit;
        this.hidePopup = hidePopup;
        this.hidePopupAndEdge = hidePopupAndEdge;
        this.nodesElement = nodesElem;
        this.newCommandComponent = newCommandComponent;
        this.startEdge = startEdge;
        this.moveEdge = moveEdge;
        this.endEdge = endEdge;
        this.mapPointToScene = mapPointToScene;
        this.mapMouseToScene = mapMouseToScene;
        this.mapMouseToView = mapMouseToView;

        this.isOutputPort = function(port){
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
          printget({type: 'remove component', componentId: component.id});
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
          viewGraph(viewId);
        };
        this.revertToRoot = function(){
          scope.visualData = graphModel;
        };
        this.translateNode = function(id, position, x, y){
          var i$, ref$, len$, el;
          position.x += x / scale;
          position.y += y / scale;
          scope.$digest();
        };
      }
    ]
  };
});


function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}


app.directive("elscope", function($document){
  return {
    link: function(scope, element){
      scope.scopedElement = element;
    }
  };
});