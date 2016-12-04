/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/

import {SocketService} from "./socket.service"
import * as Mousetrap from "mousetrap"
import macroCtrl = require("./controllers/macro.controller")
import shellProject = require("./controllers/shell-project.controller")
import tip      = require("./directives/tip.directive")
import terminal = require("./directives/terminal.directive")
import filesystem = require("./directives/filesystem.directive")
import directoryFile = require("./directives/directory-file.directive")

var j = [macroCtrl,shellProject,tip,terminal,filesystem,directoryFile];

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