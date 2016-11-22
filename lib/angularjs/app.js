/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
"use strict";
var socket_service_1 = require("./socket.service");
var Mousetrap = require("mousetrap");
var macroCtrl = require("./controllers/macro.controller");
var tip = require("./directives/tip.directive");
macroCtrl.init();
tip.init();
function getCSSSupportedProp(proparray) {
    var root = document.documentElement;
    for (var i = 0, len = proparray.length; i < len; ++i) {
        if (proparray[i] in root.style) {
            return proparray[i];
        }
    }
}
var cssTransform = window["cssTransform"] = getCSSSupportedProp(['transform', 'WebkitTransform', 'MsTransform']);
var socket = window["socket"] = socket_service_1.SocketService.socket;
socket.on('mess', function (data) { console.log('mess', data); });
socket.on('message', function (data) { console.log('message', data); });
socket.on('connect', function socketConnected() {
    console.log("This is from the connect: ", socket.id);
});
Mousetrap.bind("shift+p", function () {
    document.body.classList.add("sr-shoot");
    window.print();
    document.body.classList.remove("sr-shoot");
});
