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

var app = angular.module('app', ['ui.bootstrap', 'ui.layout']);

var socket = io.socket;
var pathArray = window.location.pathname.split( '/' );
var projId = pathArray[pathArray.length - 1];

window.projId = projId;

socket.on('mess', function(data){ console.log('mess', data) });
socket.on('message', function(data){ console.log('message', data) });
socket.on('connect', function socketConnected() {
  console.log("This is from the connect: ", this.socket.sessionid);
  var _csrf = null;

  socket.get('/csrfToken', {id:projId}, function(data){
    _csrf = data._csrf;
    window._csrf = _csrf
  });

  window.printget = function(reqdata){
    console.log('posting movement', reqdata);
    io.socket.post('/project/graphaction', {id:projId, message:reqdata,_csrf:_csrf}, function(data){
      console.log(data);
    });
  }
});