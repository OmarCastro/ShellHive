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
var shellProject = require("./controllers/shell-project.controller");
var terminal = require("./directives/terminal.directive");
macroCtrl.init();
shellProject.init();
tip.init();
terminal.init();
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
