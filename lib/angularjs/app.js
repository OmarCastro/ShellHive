"use strict";
var socket_service_1 = require("./socket.service");
var Mousetrap = require("mousetrap");
var macroCtrl = require("./controllers/macro.controller");
var shellProject = require("./controllers/shell-project.controller");
var tip = require("./directives/tip.directive");
var terminal = require("./directives/terminal.directive");
var filesystem = require("./directives/filesystem.directive");
var directoryFile = require("./directives/directory-file.directive");
var connectorsLayer = require("./directives/connectors-layer.directive");
var connector = require("./directives/connector.directive");
var port = require("./directives/port.directive");
var parameterField = require("./directives/parameter-field.directive");
var mousetrap = require("./directives/mousetrap.directive");
var j = [macroCtrl, shellProject, tip, terminal, filesystem, directoryFile, connectorsLayer, connector, port,
    parameterField, mousetrap]; //force browserify to add the requires
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
