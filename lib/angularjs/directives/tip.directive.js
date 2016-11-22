"use strict";
var app = require("../app.module");
app.directive("tip", [function () {
        return {
            restrict: "C",
            scope: true,
            link: function (scope, element, attr) {
                element.hover(function () {
                    if (!scope.status.noTooltip) {
                        scope.$applyAsync("showTooltip = true");
                    }
                }, function () {
                    scope.$applyAsync("showTooltip = false");
                });
            }
        };
    }]);
module.exports = { init: function () { } };
