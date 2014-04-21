var $ = require("./_init");
var Graph = require("../../common/graph");
var Boundary = Graph.Boundary;

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
        var subresult, i$, ref$, len$, sub;
        subresult = parser.parseAST(commandList, tracker);
        boundaries.push(Boundary.createFromComponents(subresult.components));
        for (i$ = 0, len$ = (ref$ = subresult.components).length; i$ < len$; ++i$) {
            sub = ref$[i$];
            result.components.push(sub);
        }
        for (i$ = 0, len$ = (ref$ = subresult.connections).length; i$ < len$; ++i$) {
            sub = ref$[i$];
            result.connections.push(sub);
        }
        result.connections.push({
            startNode: previousCommand.id,
            startPort: 'output',
            endNode: subresult.firstMainComponent,
            endPort: 'input'
        });
    };
}
function parseCommand(argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections) {
    var boundaries, result, connectTo, i$, len$, argNode;
    boundaries = [];
    result = {
        firstMainComponent: firstMainComponent,
        components: components,
        connections: connections
    };
    if (previousCommand instanceof Array) {
        previousCommand = previousCommand[1];
    }
    connectTo = connector(parser, previousCommand, result, boundaries, tracker);
    for (i$ = 0, len$ = argsNode.length; i$ < len$; ++i$) {
        argNode = argsNode[i$];
        switch ($.typeOf(argNode)) {
            case 'outToProcess':
                connectTo(argNode[1]);
        }
    }
    if (nextcommands.length) {
        connectTo(nextcommands);
    }
    arrangeLayout(previousCommand, boundaries);
    result.counter = tracker.id;
    return result;
}
exports.parseCommand = parseCommand;
;
//# sourceMappingURL=tee.js.map
