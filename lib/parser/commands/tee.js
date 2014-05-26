var $ = require("../utils/init");
var GraphModule = require("../../common/graph");
var Graph = GraphModule.Graph;
var Boundary = GraphModule.Boundary;
var Connection = GraphModule.Connection;

/**
Arranges the nodes using a hierarchical layout
*/
function arrangeLayout(previousCommand, boundaries) {
    var maxX = 0;
    var minY = previousCommand.position.y - (boundaries.length - 1) * 250;
    if (minY < 0) {
        previousCommand.position.y -= minY;
        minY = 0;
    }
    var prevBound = null;
    var translateX = previousCommand.position.x + 500;
    boundaries.forEach(function (boundary) {
        var translateY = prevBound ? prevBound.bottom - boundary.top : minY;
        boundary.translateXY(translateX, translateY);
        prevBound = boundary;
    });
}
function connector(parser, previousCommand, result, boundaries, tracker) {
    return function (commandList) {
        var subresult = parser.parseAST(commandList, tracker);
        boundaries.push(Boundary.createFromComponents(subresult.components));
        result.components = result.components.concat(subresult.components);
        result.connections = result.connections.concat(subresult.connections);
        result.connections.push(new Connection(previousCommand, "output", subresult.firstMainComponent, 'input'));
    };
}

function parseCommand(argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections) {
    var boundaries, i$, len$, argNode;
    boundaries = [];

    var result = new Graph();
    result.firstMainComponent = firstMainComponent;
    result.components = components;
    result.connections = connections;

    var connectTo = connector(parser, previousCommand[1], result, boundaries, tracker);
    for (i$ = 0, len$ = argsNode.length; i$ < len$; ++i$) {
        argNode = argsNode[i$];
        if ($.typeOf(argNode) == 'outToProcess') {
            connectTo(argNode[1]);
        }
    }
    if (nextcommands.length) {
        connectTo(nextcommands);
    }
    arrangeLayout(previousCommand[1], boundaries);
    result.counter = tracker.id;
    return result;
}
exports.parseCommand = parseCommand;
;
