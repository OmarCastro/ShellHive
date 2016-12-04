"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseRoute = (function () {
    function BaseRoute(router, type, _url, data) {
        this.router = router;
        this.type = type;
        this._url = _url;
        this.data = data;
    }
    Object.defineProperty(BaseRoute.prototype, "url", {
        get: function () { return this._url; },
        enumerable: true,
        configurable: true
    });
    return BaseRoute;
}());
var SignalEmitter = (function (_super) {
    __extends(SignalEmitter, _super);
    function SignalEmitter() {
        return _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SignalEmitter.prototype, "request", {
        get: function () {
            return this.router.request({ url: this.url, type: this.type, data: this.data });
        },
        enumerable: true,
        configurable: true
    });
    return SignalEmitter;
}(BaseRoute));
exports.SignalEmitter = SignalEmitter;
var Route = (function (_super) {
    __extends(Route, _super);
    function Route() {
        return _super.apply(this, arguments) || this;
    }
    Route.prototype.request = function (onSuccess) {
        this.router.request({ url: this.url, type: this.type, data: this.data, onSuccess: onSuccess });
    };
    return Route;
}(BaseRoute));
exports.Route = Route;
var Router = (function () {
    function Router() {
        var _this = this;
        this.subscribeGraph = function (graph) { return _this.get('/graph/subscribe/', graph); };
        this.subscribeProject = function (graph) { return _this.get('/project/subscribe', graph); };
        this.directoriesOfProject = function (projectId) { return _this.get("/directories/project/" + projectId, null); };
        this.uploadToProject = function (projectId) { return _this.sget("/upload/" + projectId, null); };
        this.setUserName = function (user) { return _this.spost('/project/setmyname', user); };
    }
    Router.prototype.get = function (url, data) { return new Route(this, "get", url, data); };
    Router.prototype.sget = function (url, data) { return new SignalEmitter(this, "get", url, data); };
    Router.prototype.spost = function (url, data) { return new SignalEmitter(this, "get", url, data); };
    Router.prototype.callable = function (router) {
        var route = function () { return router; };
        Object.defineProperty(route, "request", { get: function () { return router.request; } });
        Object.defineProperty(route, "url", { get: function () { return router.url; } });
        return route;
    };
    return Router;
}());
exports.Router = Router;
