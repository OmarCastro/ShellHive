"use strict";
var Router = (function () {
    function Router() {
    }
    Router.prototype.get = function (url, data, onSuccess) {
        this.request({ url: url, type: "get", data: data, onSuccess: onSuccess });
    };
    ;
    Router.prototype.post = function (url, data, onSuccess) {
        this.request({ url: url, type: "post", data: data, onSuccess: onSuccess });
    };
    ;
    return Router;
}());
exports.Router = Router;
