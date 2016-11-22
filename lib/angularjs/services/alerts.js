"use strict";
var app = require("../app.module");
var serviceDeclaration = ["$timeout", alertService];
exports.serviceName = "alerts";
app.service(exports.serviceName, serviceDeclaration);
function alertService($timeout) {
    var alerts = [];
    var service = this;
    service.alerts = alerts;
    service.addAlert = function (msg) {
        msg.type = "danger";
        alerts.push(msg);
        service.removeAfter(msg, 5000);
    };
    service.addNotification = function (msg) {
        msg.type = "info";
        alerts.push(msg);
        return msg;
    };
    service.removeAfter = function (msg, time) {
        $timeout(function () {
            var indx = alerts.indexOf(msg);
            if (indx < 0)
                return;
            service.closeAlert(indx);
        }, time);
    };
    service.closeAlert = function (index) {
        alerts.splice(index, 1);
    };
}
