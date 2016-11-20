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

var serviceName = 'creationPopup'
var serviceDeclaration : (Function | string | Function)[] = ["$rootScope", creationPopupService]


app.service(serviceName, serviceDeclaration)

function creationPopupService($rootScope: angular.IRootScopeService){
  
  var service: ICreationPopupService = this;
  var popupState: IPopupState = {
    x: 0,
    y: 0,
    startNode: 0,
    startPort: 0
  };
  service.popupText = ''
  var popup: HTMLElement = <HTMLElement> document.querySelector("div[graph] .popup");
  var $popup = $(popup);
  var popupHeight = $popup.find("form").height();
  var $popupInput = $popup.find("input");
  var simpleEdge = document.querySelector('.emptyEdge');
  var scope;

  $popup.hide();


  service.showPopup = function(event, startNode, startPort, endNode, endPort){
    service.popupText = '';
    var {x,y} = window["mapMouseToView"](event);
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
  var popupSubmit = function(content){
    var comp;
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