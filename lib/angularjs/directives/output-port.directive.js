"use strict";
var app = require("../app.module");
app.directive("outputPort", function () { return ({
    require: 'port',
    priority: 2,
    template: require("./output-port.html")
}); });
