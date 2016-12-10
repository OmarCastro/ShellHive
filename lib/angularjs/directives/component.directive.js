"use strict";
var app = require("../app.module");
var csrf_1 = require("../services/csrf");
app.directive("component", ['$document', function ($document) {
        var pointerId;
        pointerId = 0;
        return {
            require: '^graph',
            scope: true,
            link: function (scope, element, attr, graphModelController) {
                var datanode = scope.data;
                function findMacro() {
                    var macros = scope.graphData.macros;
                    var ref = scope.graphData.macroList;
                    for (var i = ref.length - 1; i >= 0; i--) {
                        var macro = macros[ref[i]];
                        if (macro.id == datanode.graph) {
                            return macro;
                        }
                    }
                    ;
                }
                ;
                function updatePorts() {
                    scope.inputPorts = [];
                    scope.outputPorts = [];
                    switch (datanode.type) {
                        case 'file':
                            scope.inputPorts = [{ name: "input", text: "overwrite" },
                                { name: "append", text: "append" }];
                            scope.outputPorts = [{ name: "output", text: "content" }];
                            break;
                        case 'command':
                            scope.inputPorts = [{ name: "input", text: "stdin" }];
                            scope.outputPorts = [{ name: "output", text: "stdout" },
                                { name: "error", text: "stderr" },
                                { name: "retcode", text: "return" }];
                            break;
                        case 'macro':
                            var macro = findMacro();
                            scope.inputPorts = macro.inputs.map(function (text, index) {
                                return { name: "macroIn" + index, text: text };
                            });
                            scope.outputPorts = macro.outputs.map(function (text, index) {
                                return { name: "macroOut" + index, text: text };
                            });
                            break;
                        default:
                            scope.inputPorts = [];
                            scope.outputPorts = [];
                    }
                    if (scope.collapsed) {
                        console.log("collapsed");
                        scope.inputPorts = scope.inputPorts.filter(existConnectionToPort);
                        scope.outputPorts = scope.outputPorts.filter(existConnectionToPort);
                    }
                }
                updatePorts();
                var startX, startY, title, position, elem, imstyle;
                startX = 0;
                startY = 0;
                title = datanode.title;
                position = datanode.position;
                scope.collapsed = false;
                scope.togglecollapse = function () {
                    scope.collapsed = !scope.collapsed;
                    updatePorts();
                    requestAnimationFrame(function () {
                        $('path[connector]').each(function (index) {
                            var scope = $(this).scope();
                            if (scope.endsPositions && scope.endsPositions[0] == position || scope.endsPositions[1] == position) {
                                scope.reset();
                            }
                        });
                    });
                };
                scope.update = function () {
                    scope.transform = "translate(" + position.x + "px, " + position.y + "px)";
                };
                function existConnectionToPort(port) {
                    return !scope.graphData.connections.every(function (connection) {
                        return (connection.startNode != datanode.id || connection.startPort != port.name)
                            && (connection.endNode != datanode.id || connection.endPort != port.name);
                    });
                }
                switch (datanode.type) {
                    case 'file':
                        scope.title = {
                            name: "file",
                            buttons: true
                        };
                        break;
                    case 'command':
                        scope.title = {
                            name: datanode.exec,
                            buttons: true
                        };
                        break;
                    case 'macro':
                        var macro = findMacro();
                        scope.title = {
                            name: macro.name,
                            description: macro.description,
                            buttons: true
                        };
                        break;
                    case 'input':
                        scope.title = {
                            name: "INPUT",
                            buttons: false
                        };
                        break;
                    case 'output':
                        scope.title = {
                            name: "OUTPUT",
                            buttons: false
                        };
                        break;
                }
                scope.updatePorts = updatePorts;
                scope.update();
                elem = element[0];
                imstyle = elem.style;
                //scope.$watch('data.position',scope.update, true);
                var drag = false;
                element.bind("pointerdown", function (ev) {
                    var event, targetTag;
                    //console.log(datanode);
                    switch (ev.which) {
                        case 2:
                            return true;
                        case 3:
                            return false;
                    }
                    graphModelController.hidePopupAndEdge();
                    event = ev.originalEvent;
                    targetTag = event.target.tagName;
                    console.log(targetTag);
                    if (pointerId || 'INPUT SELECT LABEL BUTTON A TEXTAREA'.split(" ").indexOf(targetTag) >= 0) {
                        return true;
                    }
                    var drag = false;
                    pointerId = event.pointerId;
                    $document.bind("pointermove", mousemove);
                    $document.bind("pointerup", mouseup);
                    startX = ev.screenX;
                    startY = ev.screenY;
                    return false;
                });
                function mousemove(ev) {
                    var event = ev.originalEvent;
                    moveBy(event.screenX - startX, event.screenY - startY);
                    startX = event.screenX;
                    startY = event.screenY;
                }
                ;
                function moveBy(x, y) {
                    drag = true;
                    graphModelController.translateNode(datanode.id, position, x, y);
                    csrf_1.CSRF.printget({ type: 'move', componentId: scope.data.id, movepos: position });
                    scope.update();
                    $('path[connector]').each(function (index) {
                        var scope = $(this).scope();
                        if (scope.edge) {
                            if (scope.edge.startNode == datanode.id) {
                                scope.update(position);
                            }
                            else if (scope.edge.endNode == datanode.id) {
                                scope.update(null, position);
                            }
                        }
                    });
                    //
                    //io.socket.get('/users/3',function serverSays(err,users){
                    //    if (err)
                    //        console.log(err)
                    //    console.log(JSON.stringify(users));
                    //});
                }
                ;
                function mouseup(ev) {
                    pointerId = 0;
                    $document.unbind("pointermove", mousemove);
                    $document.unbind("pointerup", mouseup);
                    if (drag) {
                        scope.$emit('updateComponent', datanode);
                        drag = false;
                        ev.preventDefault();
                        return false;
                    }
                }
                ;
            }
        };
    }]);
