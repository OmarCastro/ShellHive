"use strict";
var routes_model_1 = require("./routes.model");
var RouteTable = (function () {
    function RouteTable() {
        this.homePage = function () { return new routes_model_1.Route(routes_model_1.method.get, '/'); };
        this.graphSubscription = function () { return new routes_model_1.Route(routes_model_1.method.get, '/graph/subscribe'); };
        this.projectSubscription = function () { return new routes_model_1.Route(routes_model_1.method.get, '/project/subscribe'); };
        this.directoriesOfProject = function (projectId) { return new routes_model_1.Route(routes_model_1.method.get, '/directories/project/:projectId', { projectId: projectId }); };
        this.uploadToProject = function (projectId) { return new routes_model_1.Route(routes_model_1.method.get, '/upload/:projectId', { projectId: projectId }); };
        this.setUserName = function () { return new routes_model_1.Route(routes_model_1.method.post, '/project/setmyname'); };
    }
    return RouteTable;
}());
exports.RouteTable = RouteTable;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new RouteTable();
