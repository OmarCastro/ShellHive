/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />
"use strict";
var SocketService = (function () {
    function SocketService() {
    }
    Object.defineProperty(SocketService, "socketId", {
        get: function () {
            return SocketService.m_socket.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SocketService, "socket", {
        get: function () {
            return SocketService.m_socket;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SocketService, "sailsSocket", {
        get: function () {
            return io.socket;
        },
        enumerable: true,
        configurable: true
    });
    return SocketService;
}());
exports.SocketService = SocketService;
SocketService.m_socket = io();
