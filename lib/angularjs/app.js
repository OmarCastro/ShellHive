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
var shellProject = require("./controllers/shell-project.controller");
var tip = require("./directives/tip.directive");
var terminal = require("./directives/terminal.directive");
var filesystem = require("./directives/filesystem.directive");
var directoryFile = require("./directives/directory-file.directive");
var j = [macroCtrl, shellProject, tip, terminal, filesystem, directoryFile];
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
