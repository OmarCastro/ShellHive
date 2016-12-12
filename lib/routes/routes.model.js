"use strict";
(function (method) {
    method[method["get"] = 0] = "get";
    method[method["post"] = 1] = "post";
    method[method["put"] = 2] = "put";
    method[method["delete"] = 3] = "delete";
})(exports.method || (exports.method = {}));
var method = exports.method;
var Route = (function () {
    function Route(method, route_url, params) {
        if (params === void 0) { params = {}; }
        this.method = method;
        this.route_url = route_url;
        this.params = params;
        this.url = route_url.replace(/\/:([a-zA-Z][a-zA-Z0-9]*)/g, function (substr, group1) { return params[group1]; });
    }
    return Route;
}());
exports.Route = Route;
