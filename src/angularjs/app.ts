import {SocketService} from "./socket.service"
import * as Mousetrap from "mousetrap"
import macroCtrl = require("./controllers/macro.controller")
import shellProject = require("./controllers/shell-project.controller")
import tip      = require("./directives/tip.directive")
import terminal = require("./directives/terminal.directive")
import filesystem = require("./directives/filesystem.directive")
import directoryFile = require("./directives/directory-file.directive")
import connectorsLayer = require("./directives/connectors-layer.directive")
import port = require("./directives/port.directive")
import inputPort = require("./directives/input-port.directive")
import outputPort = require("./directives/output-port.directive")
import parameterField = require("./directives/parameter-field.directive")
import mousetrap = require("./directives/mousetrap.directive")
import components = require("./components")
import minimap = require("./components/minimap")

var j = [macroCtrl,shellProject,tip,terminal,filesystem,directoryFile, connectorsLayer, inputPort, outputPort, port,
parameterField,mousetrap,components, minimap]; //force browserify to add the requires

const socket = window["socket"] = SocketService.socket


socket.on('mess', function(data){ console.log('mess', data) });
socket.on('message', function(data){ console.log('message', data) });
socket.on('connect', function socketConnected() {
  console.log("This is from the connect: ", socket.id);
});

Mousetrap.bind("shift+p", function(){
  document.body.classList.add("sr-shoot")
  window.print();
  document.body.classList.remove("sr-shoot")
})