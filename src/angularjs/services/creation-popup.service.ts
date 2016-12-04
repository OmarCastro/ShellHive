import * as app from "../app.module"


interface IPopupState {
  x: number;
  y: number;
  startNode: number;
  startPort: number;
  endNode?: any ;
  endPort?: any;

}

interface ICreationPopupService {
  popupText: string;
  setScope: (newscope: angular.IScope) => void;
  showPopup: (event, startNode: number, startPort: number, endNode: number, endPort: number) => void;
  popupSubmit: (content) => void;
  hidePopup: () => void ;

}

const serviceName = 'creationPopup'
const serviceDeclaration : (Function | string)[] = ["$rootScope", creationPopupService]


app.service(serviceName, serviceDeclaration)

function creationPopupService($rootScope: angular.IRootScopeService){
  
  let service: ICreationPopupService = this;
  let popupState: IPopupState = {
    x: 0,
    y: 0,
    startNode: 0,
    startPort: 0
  };
  service.popupText = ''
  const popup: HTMLElement = <HTMLElement> document.querySelector("div[graph] .popup");
  const $popup = $(popup);
  const popupHeight = $popup.find("form").height();
  const $popupInput = $popup.find("input");
  const simpleEdge = document.querySelector('.emptyEdge');
  let scope;

  $popup.hide();


  service.showPopup = function(event, startNode, startPort, endNode, endPort){
    service.popupText = '';
    const {x,y} = window["mapMouseToView"](event);
    popupState.x = x; 
    popupState.y = y;
    popupState.startNode = startNode;
    popupState.startPort = startPort;
    popupState.endNode = endNode;
    popupState.endPort = endPort;
    popup.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y - popupHeight / 2) + "px)";
    $popup.show();
    $popupInput.focus();
    $rootScope.$digest();
  };
  const popupSubmit = function(content){
    scope.$emit('addAndConnectComponent', {
      command: content,
      componentId: popupState.startNode,
      startPort: popupState.startPort,
      position: {x: popupState.x , y: popupState.y}
    })
    hidePopup();
    window["endEdge"]();
    
  };
  function hidePopup(){
    $popup.hide();
    scope.sel = { open: false };
    scope.safedigest();
  };

  service.setScope = function(newscope){scope = newscope; }
  service.popupSubmit = popupSubmit
  service.hidePopup = hidePopup

}

export = serviceName