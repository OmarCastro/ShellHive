"use strict";
var app = require("../app.module");
app.directive("parameterField", ['$timeout', function ($timeout) {
        return {
            scope: true,
            link: function (scope, element, attr) {
                if (attr.type === 'radio' || attr.type === 'checkbox')
                    return;
                function sendUpdate() {
                    scope.$emit('updateComponent', scope.data);
                }
                var promise;
                element.bind('keyup', function () {
                    $timeout.cancel(promise);
                    promise = $timeout(sendUpdate, 500);
                });
                element.bind('blur', function () {
                    $timeout.cancel(promise);
                    scope.$applyAsync(sendUpdate);
                });
            }
        };
    }]);
