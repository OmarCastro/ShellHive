"use strict";
var app = require("../app.module");
var port_html_1 = require("./port.html");
app.directive("port", ['$document', function ($document) { return ({
        require: '^graph',
        template: port_html_1.default,
        scope: true,
        link: function (scope, element, attr, graphController) {
            var datanode = scope.$parent.data;
            var title = datanode.title;
            var position = datanode.position;
            var elem = element[0];
            var imstyle = elem.style;
            scope.componentId = datanode.id;
            var mIn = "macroIn";
            var mOut = "macroOut";
            if (datanode.type == "input" || (attr.port.slice(0, mOut.length) == mOut && datanode.type != "output")) {
                scope.isOutputNode = true;
            }
            else if (datanode.type == "output" || (attr.port.slice(0, mIn.length) == mIn && datanode.type == "input")) {
                scope.isOutputNode = false;
            }
            else {
                scope.isOutputNode = graphController.isOutputPort(attr.port);
            }
            element.bind("pointerdown", function (ev) {
                graphController.startEdge(elem, datanode.type, attr.port, position, ev.originalEven);
                $document.bind("pointermove", mousemove);
                $document.bind("pointerup", mouseup);
                return false;
            });
            element.hover(function () { $(this).addClass('hover'); }, function () { $(this).removeClass('hover'); });
            function ConnectIfOk(startNode, startPort, endNode, endPort) {
                scope.$emit('connectComponent', {
                    startNode: startNode,
                    startPort: startPort,
                    endNode: endNode,
                    endPort: endPort
                });
            }
            ;
            function mousemove(ev) {
                graphController.moveEdge(ev.originalEvent);
                return true;
            }
            ;
            function mouseup(ev) {
                var outPortScope;
                var event = ev.originalEvent;
                var pointedElem = document.elementFromPoint(event.clientX, event.clientY);
                var $pointedElem = $(pointedElem);
                if (graphController.isFreeSpace(pointedElem)) {
                    if (scope.isOutputNode) {
                        graphController.showPopup(event, scope.componentId, attr.port, null, 'input');
                    }
                    else {
                        graphController.showPopup(event, null, 'output', scope.componentId, attr.port);
                    }
                }
                else {
                    graphController.endEdge();
                    var outAttr = $pointedElem.attr("data-port") || $pointedElem.parent().attr("data-port");
                    if (outAttr) {
                        var outPortScope_1 = $pointedElem.scope();
                        if (scope.isOutputNode !== outPortScope_1.isOutputNode) {
                            if (scope.isOutputNode) {
                                ConnectIfOk(scope.componentId, attr.port, outPortScope_1.componentId, outAttr);
                            }
                            else {
                                ConnectIfOk(outPortScope_1.componentId, outAttr, scope.componentId, attr.port);
                            }
                        }
                    }
                }
                $document.unbind("pointermove", mousemove);
                $document.unbind("pointerup", mouseup);
            }
            ;
        }
    }); }]);