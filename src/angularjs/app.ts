import {SocketService} from "./socket.service"
import * as Mousetrap from "mousetrap"
import macroCtrl = require("./controllers/macro.controller")
import shellProject = require("./controllers/shell-project.controller")
import tip      = require("./directives/tip.directive")
import terminal = require("./directives/terminal.directive")
import connectorsLayer = require("./directives/connectors-layer.directive")
import parameterField = require("./directives/parameter-field.directive")
import mousetrap = require("./directives/mousetrap.directive")
import components = require("./components")

const j = [macroCtrl,shellProject,tip,terminal,connectorsLayer,parameterField,mousetrap,components]; //force browserify to add the requires

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