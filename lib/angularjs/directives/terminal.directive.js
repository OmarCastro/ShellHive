"use strict";
var app = require("../app.module");
app.directive("terminal", [function () {
        return {
            restrict: "A",
            scope: true,
            template: '<pre ng-repeat="line in shellText" ng-class="line.type" ng-bind="line.text"></pre>',
            link: function (scope, element, attr) {
                var shellText = [];
                scope.shellText = shellText;
                function addLines(lines) {
                    shellText.push.apply(shellText, lines);
                    var htmlToAppend = lines.map(function (line) { return "<pre class=\"" + line.type + "\">" + line.text + "</pre>"; }).join('');
                    element.append(htmlToAppend);
                    if (shellText.length > 100) {
                        $("pre:lt(" + (shellText.length - 100) + ")").remove();
                        shellText.splice(0, shellText.length - 100);
                    }
                }
                function addText(data, type) {
                    addLines(data.split('\n').map(function (line) { return { text: line, type: type }; }));
                }
                scope.$on("Terminal::AddLines", function (event, params) { return addLines(params); });
                io.socket.on('commandCall', function (data) { return addText(data, "call"); });
                io.socket.on('stdout', function (data) { return addText(data, "info"); });
                io.socket.on('stderr', function (data) { return addText(data, "error"); });
                io.socket.on('retcode', function (data) { return addLines([{ text: "command finished with code " + data, type: "call" }]); });
            }
        };
    }]);
module.exports = { init: function () { } };
