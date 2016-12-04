"use strict";
var app = require("../app.module");
var socket_service_1 = require("../socket.service");
console.log("SocketService.sailsSocket.get csrfToken");
socket_service_1.SocketService.sailsSocket.get('/csrfToken', function (data) {
    console.log("csrfToken data: %o", data);
    CSRF.csrfToken = data._csrf;
    console.log("csrfToken set: %o", data._csrf);
    CSRF.waitingToken.forEach(function (cb) { return cb(CSRF.csrfToken); });
});
var CSRF = (function () {
    function CSRF() {
    }
    CSRF.getToken = function (fn) {
        if (CSRF.csrfToken == null) {
            CSRF.waitingToken.push(fn);
        }
        else {
            fn(CSRF.csrfToken);
        }
    };
    CSRF.printget = function (reqdata) {
        CSRF.getToken(function (data) {
            socket_service_1.SocketService.sailsSocket.post('/graph/action', { message: reqdata, _csrf: CSRF.csrfToken }, function (data) {
                console.log(data);
            });
        });
    };
    return CSRF;
}());
exports.CSRF = CSRF;
CSRF.csrfToken = null;
CSRF.waitingToken = [];
window['printget'] = CSRF.printget;
exports.serviceName = 'csrf';
app.service(exports.serviceName, function () {
    Object.defineProperty(this, "csrf", {
        get: function () { return CSRF.csrfToken; }
    });
});
