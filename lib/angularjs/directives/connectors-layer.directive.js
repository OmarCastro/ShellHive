"use strict";
var app = require("../app.module");
app.directive("connectorsLayer", [function () {
        return {
            scope: true,
            restrict: "A",
            transclude: true,
            template: "\n      <svg touch-action=\"none\">\n        <g class=\"edges\">\n          <path class=\"emptyEdge\"></path>\n          <path connector ng-repeat=\"edge in visualData.connections\" class=\"back\"></path>\n          <path connector ng-repeat=\"edge in visualData.connections\"></path>\n        </g>\n      </svg>"
        };
    }]);
