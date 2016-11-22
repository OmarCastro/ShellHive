"use strict";
var app = require("../app.module");
var serviceName = 'creationPopup';
var serviceDeclaration = ["$rootScope", creationPopupService];
app.service(serviceName, serviceDeclaration);
function creationPopupService($rootScope) {
    var service = this;
    var popupState = {
        x: 0,
        y: 0,
        startNode: 0,
        startPort: 0
    };
    service.popupText = '';
    var popup = document.querySelector("div[graph] .popup");
    var $popup = $(popup);
    var popupHeight = $popup.find("form").height();
    var $popupInput = $popup.find("input");
    var simpleEdge = document.querySelector('.emptyEdge');
    var scope;
    $popup.hide();
    service.showPopup = function (event, startNode, startPort, endNode, endPort) {
        service.popupText = '';
        var _a = window["mapMouseToView"](event), x = _a.x, y = _a.y;
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
    var popupSubmit = function (content) {
        scope.$emit('addAndConnectComponent', {
            command: content,
            componentId: popupState.startNode,
            startPort: popupState.startPort,
            position: { x: popupState.x, y: popupState.y }
        });
        hidePopup();
        window["endEdge"]();
    };
    function hidePopup() {
        $popup.hide();
        scope.sel = { open: false };
        scope.safedigest();
    }
    ;
    service.setScope = function (newscope) { scope = newscope; };
    service.popupSubmit = popupSubmit;
    service.hidePopup = hidePopup;
}
module.exports = serviceName;
