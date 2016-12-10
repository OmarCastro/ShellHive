"use strict";
var app = require("../app.module");
app.directive("minicomponent", function () {
    return {
        scope: true,
        link: function (scope, element, attr) {
            var datanode = scope.data;
            var $graphElement = scope.graphElement;
            var graphElement = $graphElement[0];
            scope.offsetWidth = 100;
            scope.offsetHeight = 100;
            var update = function () {
                var elem = graphElement.querySelector(".nodes .component[data-node-id='" + datanode.id + "']");
                scope.offsetWidth = (elem) ? elem.offsetWidth : 100;
                scope.offsetHeight = (elem) ? elem.offsetHeight : 100;
                scope.$digest();
            };
            if (datanode.files !== null) {
                scope.$watch("data.files.length", function () {
                    requestAnimationFrame(update);
                });
            }
            scope.$watch("data", function () {
                requestAnimationFrame(update);
            });
            requestAnimationFrame(update);
        }
    };
});
