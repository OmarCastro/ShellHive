"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var router_1 = require("../../routes/router");
var socket_service_1 = require("../socket.service");
var csrf_1 = require("../services/csrf");
var utils_1 = require("../utils");
var Router = (function (_super) {
    __extends(Router, _super);
    function Router() {
        return _super.apply(this, arguments) || this;
    }
    Router.prototype.request = function (params) {
        switch (params.type) {
            case "get": return socket_service_1.SocketService.sailsSocket.get(params.url, params.data, params.onSuccess);
            case "post": {
                var data = params.data;
                data._csrf = data._csrf || csrf_1.CSRF.csrfToken;
                return socket_service_1.SocketService.sailsSocket.post(params.url, data, params.onSuccess);
            }
        }
    };
    Object.defineProperty(Router.prototype, "directoriesOfCurrentProject", {
        get: function () { return this.callable(this.directoriesOfProject(utils_1.projectId)); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router.prototype, "uploadToCurrentProject", {
        get: function () { return this.callable(this.uploadToProject(utils_1.projectId)); },
        enumerable: true,
        configurable: true
    });
    return Router;
}(router_1.Router));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new Router();
