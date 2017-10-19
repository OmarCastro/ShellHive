"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var routes_model_1 = require("./routes.model");
var RouteTable = (function () {
    function RouteTable() {
        this.homePage = function () { return new routes_model_1.Route(routes_model_1.Method.get, '/'); };
        this.graphSubscription = function () { return new routes_model_1.Route(routes_model_1.Method.get, '/graph/subscribe'); };
        this.projectSubscription = function () { return new routes_model_1.Route(routes_model_1.Method.get, '/project/subscribe'); };
        this.directoriesOfProject = function (projectId) { return new routes_model_1.Route(routes_model_1.Method.get, '/directories/project/:projectId', { projectId: projectId }); };
        this.uploadToProject = function (projectId) { return new routes_model_1.Route(routes_model_1.Method.get, '/upload/:projectId', { projectId: projectId }); };
        this.setUserName = function () { return new routes_model_1.Route(routes_model_1.Method.post, '/project/setmyname'); };
        this.chat = function () { return new routes_model_1.Route(routes_model_1.Method.post, '/project/chat'); };
        this.createComponent = function () { return new routes_model_1.Route(routes_model_1.Method.post, '/graph/createComponent/'); };
    }
    return RouteTable;
}());
exports.RouteTable = RouteTable;
exports.default = new RouteTable();
