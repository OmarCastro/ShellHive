import $ = require("./_init");
import GraphModule = require("../../common/graph")
import Graph = GraphModule.Graph;
import Boundary = GraphModule.Boundary;
import Connection = GraphModule.Connection;
/**
  Arranges the nodes using a hierarchical layout
*/
function arrangeLayout(previousCommand, boundaries:Boundary[]){
  var maxX = 0;
  var minY = previousCommand.position.y - (boundaries.length - 1) * 250;
  if (minY < 0) {
    previousCommand.position.y -= minY;
    minY = 0;
  }
  var prevBound:Boundary = null;
  var translateX = previousCommand.position.x + 500;
  boundaries.forEach(boundary => {
    var translateY = prevBound ? prevBound.bottom - boundary.top : minY
    boundary.translateXY(translateX, translateY);
    prevBound = boundary;
  });
}
function connector(parser, previousCommand, result:Graph, boundaries, tracker){
  return function(commandList){
    var subresult:Graph = parser.parseAST(commandList, tracker);
    boundaries.push(Boundary.createFromComponents(subresult.components));
    result.components = result.components.concat(subresult.components);
    result.connections = result.connections.concat(subresult.connections);
    result.connections.push(new Connection(previousCommand,'output',subresult.firstMainComponent,'input'))
  };
}

export function parseCommand(argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections){
  var boundaries:any[], i$, len$, argNode;
  boundaries = [];

  var result = new Graph();
  result.firstMainComponent = firstMainComponent;
  result.components  = components;
  result.connections = connections;
  
  if (previousCommand instanceof Array) {
    previousCommand = previousCommand[1];
  }
  var connectTo = connector(parser, previousCommand, result, boundaries, tracker);
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
};