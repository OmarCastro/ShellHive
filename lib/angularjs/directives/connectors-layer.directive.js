"use strict";
var app = require("../app.module");
app.directive("connectorsLayer", function () { return ({
    scope: true,
    restrict: "A",
    transclude: true,
    template: require("./connectors-layer.html"),
}); });
