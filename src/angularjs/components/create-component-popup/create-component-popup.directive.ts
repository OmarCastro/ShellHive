import * as app from "../../app.module"
import { GraphController } from "../graph/graph.controller"
import * as html from "./create-component-popup.html"

interface CreateComponentPopUpScope extends angular.IScope {
    popupText: string
    popupSubmit: (content: string) => void
}

app.directive("createComponentPopup", function () {
    return {
        scope: true,
        require: '^graph',
        restrict: 'A',
        template: html,
        link: function (scope: CreateComponentPopUpScope, element, attr, graphController: GraphController) {
            const $popupInput = element.find("input");
            const popupHeight = element.find("form").height();
            const popupState = {
                x: 0,
                y: 0,
                startNode: 0,
                startPort: "",
                endNode: undefined as number,
                endPort: undefined as string
            };

            scope.popupText = '';
            scope.$on("createComponentPopup::show", (event, mouseEvent: MouseEvent, startNode: number,
                startPort: string, endNode: number, endPort: string) => showPopup(mouseEvent, startNode, startPort, endNode, endPort))
            
            function showPopup(event: MouseEvent, startNode: number, startPort: string, endNode: number, endPort: string) {
                const {x,y} = graphController.mapMouseToView(event);
                const mouseToScene = graphController.mapMouseToScene(event)
                popupState.x = mouseToScene.x;
                popupState.y = mouseToScene.y;
                popupState.startNode = startNode;
                popupState.startPort = startPort;
                popupState.endNode = endNode;
                popupState.endPort = endPort;
                if (endNode) element.addClass("left-side");
                else element.removeClass("left-side");

                element[0].style.transform = "translate(" + Math.round(x) + "px," + Math.round(y - popupHeight / 2) + "px)";

                element.show();
                $popupInput.focus();
                return scope.$applyAsync();
            };


            element.hide();

            scope.$on("createComponentPopup::submit", (event, params: string) => popupSubmit(params))
            scope.popupSubmit = popupSubmit;
            function popupSubmit(content: string) {
                console.log("popupSubmit:", content);

                if (popupState.startNode || popupState.endNode) {

                    scope.$emit('addAndConnectComponent', (popupState.startNode) ? {
                        command: content,
                        componentId: popupState.startNode,
                        startPort: popupState.startPort,
                        position: { x: popupState.x, y: popupState.y },
                        fromInput: false
                    } : {
                            command: content,
                            componentId: popupState.endNode,
                            startPort: popupState.endPort,
                            position: { x: popupState.x - 150, y: popupState.y },
                            fromInput: true
                        })
                } else {
                    graphController.createCommandComponent({
                        command: content,
                        position: popupState
                    })
                   
                }
                graphController.hidePopupAndEdge();
            }

            scope.$on("createComponentPopup::hide", () => element.hide())
        }
    }
});
