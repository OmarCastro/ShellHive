/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/

import {SocketService} from "./socket.service"
import * as Mousetrap from "mousetrap"
import macroCtrl = require("./controllers/macro.controller")
import tip = require("./directives/tip.directive")
macroCtrl.init()
tip.init()
function getCSSSupportedProp(proparray){
  var root = document.documentElement;
  for (var i = 0, len = proparray.length; i < len; ++i) {
    if (proparray[i] in root.style) {
      return proparray[i];
    }
  }
}

var cssTransform = window["cssTransform"]= getCSSSupportedProp(['transform', 'WebkitTransform', 'MsTransform']);

var socket = window["socket"] = SocketService.socket


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