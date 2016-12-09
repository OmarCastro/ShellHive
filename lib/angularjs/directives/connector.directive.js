"use strict";
var app = require("../app.module");
app.directive("connector", [function () {
        "use strict";
        return {
            scope: true,
            restrict: "A",
            link: function (scope, element, attr) {
                var StartPortOffset, EndPortOffset;
                var dataedge = scope.$parent.edge;
                var elem = element[0];
                var $graphElement = scope.graphElement;
                var graphElement = $graphElement[0];
                var startComponent = dataedge.startComponent;
                var startPosition = startComponent.position;
                var endComponent = dataedge.endComponent;
                var endPosition = endComponent.position;
                scope.endsPositions = [startPosition, endPosition];
                function queryConnectorInfo() {
                    var Startnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.startNode + "']");
                    var StartPort = Startnode.querySelector("[data-port='" + dataedge.startPort + "'] > .box");
                    var Endnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.endNode + "']");
                    var EndPort = Endnode.querySelector("[data-port='" + dataedge.endPort + "'] > .box");
                    StartPortOffset = {
                        top: StartPort.offsetTop + StartPort.offsetHeight * 0.75,
                        left: StartPort.offsetLeft,
                        right: StartPort.offsetLeft + StartPort.offsetWidth
                    };
                    EndPortOffset = {
                        top: EndPort.offsetTop + EndPort.offsetHeight * 0.75,
                        left: EndPort.offsetLeft
                    };
                }
                function update(startPos, endPos) {
                    if (!StartPortOffset || !EndPortOffset) {
                        queryConnectorInfo();
                    }
                    startPosition = startPos || startPosition;
                    endPosition = endPos || endPosition;
                    scope.endsPositions[0] = startPosition;
                    scope.endsPositions[1] = endPosition;
                    //console.log('updating edge')
                    setEdgePath(startPosition.x + StartPortOffset.right - 2, startPosition.y + StartPortOffset.top, endPosition.x + EndPortOffset.left + 2, endPosition.y + EndPortOffset.top);
                }
                ;
                var elementClass = "from-" + startComponent.type;
                elem.classList.add(elementClass);
                elem.classList.add(elementClass + "-" + dataedge.startPort);
                element.bind("pointerdown", function (event) {
                    var orig = event.originalEvent;
                    var clientX = orig.clientX;
                    var clientY = orig.clientY;
                    scope.$apply(function () {
                        var data = {
                            x: clientX,
                            y: clientY,
                            transform: "translate(" + clientX + "px," + clientY + "px)",
                            index: scope.$index,
                            id: dataedge.id
                        };
                        if (scope.edgePopups.length) {
                            scope.edgePopups[0] = data;
                        }
                        else {
                            scope.edgePopups.push(data);
                        }
                    });
                });
                var setEdgePath = function (iniX, iniY, endX, endY) {
                    var xpoint = (endX - iniX) / 4;
                    elem.setAttribute('d', "M " + iniX + " " + iniY
                        + " H " + (iniX + 0.5 * xpoint)
                        + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
                        + " H " + endX);
                };
                scope.update = update;
                scope.reset = function () {
                    queryConnectorInfo();
                    update();
                };
                requestAnimationFrame(function () {
                    scope.$watch('edge.endPort', scope.reset);
                    //scope.$watch('endsPositions',scope.update,true)
                    requestAnimationFrame(scope.reset);
                });
            }
        };
    }]);