"use strict";
var Method;
(function (Method) {
    Method[Method["get"] = 0] = "get";
    Method[Method["post"] = 1] = "post";
    Method[Method["put"] = 2] = "put";
    Method[Method["delete"] = 3] = "delete";
})(Method = exports.Method || (exports.Method = {}));
var Route = (function () {
    function Route(method, route_url, params) {
        if (params === void 0) { params = {}; }
        this.method = method;
        this.route_url = route_url;
        this.params = params;
        this.url = route_url.replace(/\/:([a-zA-Z][a-zA-Z0-9]*)/g, function (substr, group1) { return "/" + params[group1]; });
        this.methodName = Method[this.method];
    }
    return Route;
}());
exports.Route = Route;
