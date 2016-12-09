"use strict";
var routes_model_1 = require("../../routes/routes.model");
var socket_service_1 = require("../socket.service");
var csrf_1 = require("../services/csrf");
var route_table_1 = require("../../routes/route-table");
exports.routeTable = route_table_1.default;
var TransactionHandler = (function () {
    function TransactionHandler() {
        this.reponseHandlers = [];
        this.errorHandlers = [];
    }
    TransactionHandler.prototype.handleReponses = function (data) { this.reponseHandlers.forEach(function (handler) { return handler(data); }); };
    TransactionHandler.prototype.handleErrors = function () { this.errorHandlers.forEach(function (handler) { return handler(); }); };
    return TransactionHandler;
}());
var Transaction = (function () {
    function Transaction(handlers, payload, routeUsed) {
        this.handlers = handlers;
        this.payload = payload;
        this.routeUsed = routeUsed;
    }
    Transaction.prototype.onResponse = function (responseHandler) {
        this.handlers.reponseHandlers.push(responseHandler);
    };
    Transaction.prototype.onError = function (responseHandler) {
        this.handlers.reponseHandlers.push(responseHandler);
    };
    return Transaction;
}());
var Network = (function () {
    function Network() {
    }
    Network.prototype.fetch = function (route) {
        return this.send({ useRoute: route });
    };
    Network.prototype.send = function (params) {
        var payload = params.payload;
        var useRoute = params.useRoute;
        var handlers = new TransactionHandler();
        var transaction = new Transaction(handlers, payload, useRoute);
        switch (useRoute.method) {
            case routes_model_1.method.get: socket_service_1.SocketService.sailsSocket.get(useRoute.url, payload, handlers.handleReponses.bind(handlers));
            case routes_model_1.method.post: {
                csrf_1.CSRF.getToken(function (token) {
                    payload._csrf = payload._csrf || token;
                    socket_service_1.SocketService.sailsSocket.post(useRoute.url, payload, handlers.handleReponses.bind(handlers));
                });
            }
        }
        return transaction;
    };
    return Network;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new Network();
