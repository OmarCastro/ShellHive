"use strict";
var app = require("../app.module");
app.directive("miniconnector", function () {
    return {
        scope: true,
        link: function (scope, element, attr) {
            var dataedge = scope.$parent.edge;
            var elem = element[0];
            var startComponent = dataedge.startComponent;
            var startPosition = startComponent.position;
            var endComponent = dataedge.endComponent;
            var endPosition = endComponent.position;
            scope.endPos = endPosition;
            scope.startPos = startPosition;
            function updateEdge() {
                var iniX = startPosition.x + 50;
                var iniY = startPosition.y + 50;
                var endX = endPosition.x + 50;
                var endY = endPosition.y + 50;
                var xpoint = (endX - iniX) / 4;
                elem.setAttribute('d', "M " + iniX + " " + iniY
                    + " H " + (iniX + 0.5 * xpoint)
                    + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
                    + " H " + endX);
            }
            var elementClass = "from-" + startComponent.type;
            elem.classList.add(elementClass);
            elem.classList.add(elementClass + "-" + dataedge.startPort);
            scope.$watch("endPos", updateEdge, true);
            scope.$watch("startPos", updateEdge, true);
        }
    };
});
