import * as app from "../../app.module"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import { GraphController, GraphControllerScope } from "../graph/graph.controller"
import network from "../../router"
import { CSRF } from "../../services/csrf"



interface ComponentScope extends GraphControllerScope {
  data:any
  inputPorts: any[]
  outputPorts: any[]
  collapsed: boolean
  togglecollapse: () => void
  transform: string
  title :{
    name: string
    description?: string
    buttons: boolean
  }
}

app.directive("component", ['$document', '$rootScope', function ($document: angular.IDocumentService, $rootScope: angular.IRootScopeService) {
  let pointerId;
  pointerId = 0;
  return {
    require: '^graph',
    scope: true,
    template: require("./component.html"),
    link: function (scope: ComponentScope, element, attr, graphModelController: GraphController) {
      const datanode = scope.data as jsmodels.IComponent;
      const elem = element[0];

      scope.$on("Graph::Component::UpdatePorts", updatePorts)
      scope.$on("Graph::Component::Collapse", () => { scope.collapsed = true; updatePorts(); })
      scope.$on("Graph::Component::Uncollapse", () => { scope.collapsed = false; updatePorts(); })

      function findMacro() {
        const macros = scope.graphData.macros;
        const ref = scope.graphData.macroList
        for (let i = ref.length - 1; i >= 0; i--) {
          const macro = macros[ref[i]];
          if (macro.id == datanode.graph) {
            return macro
          }
        };
      };

      function updatePorts() {
        scope.inputPorts = [];
        scope.outputPorts = [];
        switch (datanode.type) {
          case 'file':
            scope.inputPorts = [{ name: "input", text: "overwrite" }
              , { name: "append", text: "append" }]
            scope.outputPorts = [{ name: "output", text: "content" }]
            break;
          case 'command':
            scope.inputPorts = [{ name: "input", text: "stdin" }]
            scope.outputPorts = [{ name: "output", text: "stdout" }
              , { name: "error", text: "stderr" }
              , { name: "retcode", text: "return" }]
            break;
          case 'macro':
            const macro = findMacro();
            scope.inputPorts = macro.inputs.map(function (text, index) {
              return { name: "macroIn" + index, text: text }
            })
            scope.outputPorts = macro.outputs.map(function (text, index) {
              return { name: "macroOut" + index, text: text }
            })
            break;
          default:
            scope.inputPorts = [];
            scope.outputPorts = [];
        }
        if (scope.collapsed) {
          console.log("collapsed")
          scope.inputPorts = scope.inputPorts.filter(existConnectionToPort)
          scope.outputPorts = scope.outputPorts.filter(existConnectionToPort)
        }
      }

      updatePorts();
      let startX = 0;
      let startY = 0;
      const position = datanode.position;
      scope.collapsed = false;
      scope.togglecollapse = function () {
        scope.collapsed = !scope.collapsed;
        updatePorts();
        requestAnimationFrame(function () {
          $rootScope.$broadcast("Graph::Connector::ResetOfComponent", datanode.id)
        });
      };

      function update() {
        elem.style.transform = `translate(${position.x}px, ${position.y}px)`;
      }

      function existConnectionToPort(port) {
        return !scope.graphData.connections.every(function (connection) {
          return (connection.startNode != datanode.id || connection.startPort != port.name)
            && (connection.endNode != datanode.id || connection.endPort != port.name)
        })
      }



      switch (datanode.type) {
        case 'file':
          scope.title = {
            name: "file",
            buttons: true
          }
          break;
        case 'command':
          scope.title = {
            name: datanode.exec,
            buttons: true
          }
          break;
        case 'macro':
          const macro = findMacro();
          scope.title = {
            name: macro.name,
            description: macro.description,
            buttons: true
          }
          break;
        case 'input':
          scope.title = {
            name: "INPUT",
            buttons: false
          }
          break;
        case 'output':
          scope.title = {
            name: "OUTPUT",
            buttons: false
          }
          break;

      }

      update();
      //scope.$watch('data.position',scope.update, true);
      let drag = false;

      function targetsElement(event: JQueryEventObject){
        const targetTag = (event.target as HTMLElement).tagName;
        console.log(targetTag);
        return 'INPUT SELECT LABEL BUTTON A TEXTAREA'.split(" ").indexOf(targetTag.toUpperCase()) >= 0
      }

      element.bind("pointerdown", function (ev) {
       const event = ev.originalEvent;
        //console.log(datanode);
        switch (ev.which) {
          case 2: return true;
          case 3: return false;
        }
        graphModelController.hidePopupAndEdge(); 
        if (pointerId || targetsElement(ev)) {
          return true;
        }
        drag = false;
        console.log("pointerdown")
        pointerId = (event as any).pointerId;
        $document.bind("pointermove", mousemove);
        $document.bind("pointerup", mouseup);
        startX = ev.screenX;
        startY = ev.screenY;
        return false;
      });

      function mousemove(ev) {
        const event = ev.originalEvent;
        moveBy(event.screenX - startX, event.screenY - startY);
        startX = event.screenX;
        startY = event.screenY;
      };

      function moveBy(x: number, y: number) {
        drag = true;
        graphModelController.translateNode(datanode.id, position, x, y);
        CSRF.printget({ type: 'move', componentId: scope.data.id, movepos: position });
        update();
        $rootScope.$broadcast("Graph::Connector::UpdateOfComponent",datanode.id,position)
      };

      function mouseup(ev) {
        pointerId = 0;
        $document.unbind("pointermove", mousemove);
        $document.unbind("pointerup", mouseup);
        if (drag) {
          scope.$emit('updateComponent', datanode);
          drag = false;
          ev.preventDefault();
          return false; 
        }
      };
    }
  };
}]);