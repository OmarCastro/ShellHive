app.directive("graphModel", function($document){
  return {
    replace: false,
    scope: true,
    templateUrl: 'graphTemplate.html',
    controller: ['$scope', '$element', '$modal', '$attrs','creationPopup', function(scope, element, $modal, attr,creationPopup){
        var res$, key, ref$, val, x$, $sp, scope, update, mousemove, mouseup, newComponent, newFileComponent, newMacroComponent,
          newCommandComponent, mapMouseToScene, mapMouseToView, mapPointToScene, scaleFromMouse, MouseWheelHandler, mousewheelevt,
          simpleEdge, setEdgePath, startEdge, moveEdge, endEdge,  hidePopupAndEdge;
        
        
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
       
        var toplayout = elem.querySelector(".toplayout");
        var splitbar = elem.querySelector(".ui-splitbar");
        var graphModel = scope.graphModel = scope.graphData;       
    
        scope.creationPopup = creationPopup
        creationPopup.setScope(scope);
        scope.safedigest = function(){
          if (!(scope.$$phase || scope.$root.$$phase)) {
            scope.$digest();
          }
        };
        scope.toNatNum = function(num){ return num.replace(/[^\d]/, '') };
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
          for (i$ = 0, len$ = (ref$ = scope.visualData.connections).length; i$ < len$; ++i$) {
            connection = ref$[i$];
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
          var event, targetTag, x$;
          if (ev.which === 3) {
            return false;
          }
          event = ev.originalEvent;
          targetTag = event.target.tagName;
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
          pointerId = event.pointerId;
          x$ = $document;
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });
        newComponent = function(content, position){
          if (in$(content.split(" ")[0], implementedCommands)) {
            return newCommandComponent(content, position);
          } else if (content.split(" ")[0].indexOf(".") > -1) {
            return newFileComponent(content.split(" ")[0], position);
          } else {
            return newMacroComponent(content, position);
          }
        };
        newFileComponent = function(filename, position){
          var visualData, newComponent;
          visualData = scope.visualData;
          
          newComponent = {
            type: 'file',
            id: visualData.counter++,
            filename: filename,
            position: {}
          };
          visualData.components.push(newComponent);
          importAll$(newComponent.position, position);
          return newComponent;
        };
        newMacroComponent = function(name, position){
          var visualData, newComponent;
          visualData = scope.visualData;
          newComponent = {
            type: 'subgraph',
            macro: graphModel.macros[name],
            id: visualData.counter++,
            position: {}
          };
          visualData.components.push(newComponent);
          importAll$(newComponent.position, position);
          return newComponent;
        };
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

        hidePopupAndEdge = function(){
          creationPopup.hidePopup();
          endEdge();
        };
        scope.newMacroModal = function(){
          var form, modalInstance;
          form = { name: '',  description: '',  command: ''  };
          modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: function($scope, $modalInstance){
              $scope.form = form;
              $scope.cancel = function(){
                return $modalInstance.dismiss('cancel');
              };
              $scope.ok = function(){
                $modalInstance.close(form);
              };
            }
          });
          return modalInstance.result.then(function(selectedItem){
            scope.graph.newMacro(form.name, form.description, form.command);
            return form.name = form.description = '';
          });
        };
        scope.macroEditModal = function(macroName){
          var macro, form, modalInstance;
          macro = graphModel.macros[macroName];
          form = {
            name: macro.name,
            description: macro.description
          };
          modalInstance = $modal.open({
            templateUrl: 'MacroEditModal.html',
            controller: function($scope, $modalInstance){
              $scope.form = form;
              $scope.cancel = function(){
                return $modalInstance.dismiss('cancel');
              };
              $scope.edit = function(){
                $modalInstance.close({
                  result: "edit"
                });
              };
              $scope['delete'] = function(){
                $modalInstance.close({
                  result: "delete"
                });
              };
              $scope.view = function(){
                $modalInstance.close({
                  result: "view"
                });
              };
            }
          });
          return modalInstance.result.then(function(selectedItem){
            var x$, res$, key;
            switch (selectedItem.result) {
            case "edit":
              graphModel.macros[form.name] = macro;
              delete graphModel.macros[macroName];
              x$ = macro;
              x$.name = form.name;
              x$.description = form.description;
              res$ = [];
              for (key in graphModel.macros) {
                res$.push(key);
              }
              graphModel.macroList = res$;
              scope.$digest();
              break;
            case "view":
              scope.graph.setGraphView(graphModel.macros[macroName]);
              break;
            case "delete":
              delete graphModel.macros[macroName];
              res$ = [];
              for (key in graphModel.macros) {
                res$.push(key);
              }
              graphModel.macroList = res$;
            }
            return form.name = form.description = '';
          });
        };
        scope.newCommandAtTopLeft = function(command){
          return newCommandComponent(command, mapPointToScene(0, 0));
        };
        
        this.showPopup = creationPopup.showPopup;
        this.popupSubmit = creationPopup.popupSubmit;
        this.hidePopup = creationPopup.hidePopup;
        this.hidePopupAndEdge = creationPopup.hidePopupAndEdge;


        this.nodesElement = nodesElem;
        this.newCommandComponent = newCommandComponent;
        this.newMacroComponent = newMacroComponent;
        this.startEdge = startEdge;
        this.moveEdge = moveEdge;
        this.endEdge = endEdge;
        this.mapPointToScene = mapPointToScene;
        this.mapMouseToScene = mapMouseToScene;
        this.mapMouseToView = mapMouseToView;
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
        this.setGraphView = function(view){
          hidePopupAndEdge();
          viewGraph(view.id);
        };
        this.revertToRoot = function(){
          scope.visualData = graphModel;
        };
        this.newMacro = function(name, descr, command){
          var res$, key;
          //graphModel.macros[name] = shellParser.createMacro(name, descr, command);
          //res$ = [];
          //for (key in graphModel.macros) {
          //  res$.push(key);
          //}
          //graphModel.macroList = res$;
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