"use strict";
var app = require("../app.module");
var socket_service_1 = require("../socket.service");
app.directive("terminal", [function () {
        return {
            restrict: "A",
            scope: true,
            link: function (scope, element, attr) {
                var shellText = [];
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
                socket_service_1.SocketService.socket.on('commandCall', function (data) { return addText(data, "call"); });
                socket_service_1.SocketService.socket.on('stdout', function (data) { return addText(data, "info"); });
                socket_service_1.SocketService.socket.on('stderr', function (data) { return addText(data, "error"); });
                socket_service_1.SocketService.socket.on('retcode', function (data) { return addLines([{ text: "command finished with code " + data, type: "call" }]); });
            }
        };
    }]);
