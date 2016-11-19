/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/

function getCSSSupportedProp(proparray){
  var root = document.documentElement;
  for (var i = 0, len = proparray.length; i < len; ++i) {
    if (proparray[i] in root.style) {
      return proparray[i];
    }
  }
}

var cssTransform = getCSSSupportedProp(['transform', 'WebkitTransform', 'MsTransform']);

var app = angular.module('app', ['ui.bootstrap','ngAnimate', 'ui.layout']);

var socket = io();
var pathArray = window.location.pathname.split( '/' );
var projId = pathArray[pathArray.length - 1];

window.projId = projId;
window.socket = socket;

socket.on('mess', function(data){ console.log('mess', data) });
socket.on('message', function(data){ console.log('message', data) });
socket.on('connect', function socketConnected() {
  //console.log("This is from the connect: ", this.socket.sessionid);
});

Mousetrap.bind("shift+p", function(){
  document.body.classList.add("sr-shoot")
  window.print();
  document.body.classList.remove("sr-shoot")
})