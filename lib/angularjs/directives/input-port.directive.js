"use strict";
var app = require("../app.module");
app.directive("inputPort", function () { return ({
    require: 'port',
    restrict: 'A',
    priority: 2,
    template: require("./input-port.html")
}); });
