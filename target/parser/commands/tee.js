(function(){
  var $;
  $ = require("./_init.js");
  /**
    Arranges the nodes using a hierarchical layout
  */
  function arrangeLayout(previousCommand, boundaries){
    var maxX, minY, prevBound, components, i$, len$, boundary, x, y;
    maxX = 0;
    minY = previousCommand.position.y - (boundaries.length - 1) * 250;
    if (minY < 0) {
      previousCommand.position.y -= minY;
      minY = 0;
    }
    prevBound = null;
    components = [];
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      $.translateBoundary(boundary, previousCommand.position.x + 500, prevBound ? prevBound.bottom - boundary.top : minY);
      prevBound = boundary;
      components = components.concat(boundary.components);
    }
    x = (function(){
      switch (boundaries.length) {
      case 0:
        return 0;
      default:
        return maxX + 500;
      }
    }());
    return y = (function(){
      switch (boundaries.length) {
      case 0:
        return 0;
      case 1:
        return prevBound.bottom;
      default:
        return prevBound.bottom;
      }
    }());
  }
  function connector(parser, previousCommand, result, boundaries, tracker){
    return function(commandList){
      var subresult, i$, ref$, len$, sub;
      subresult = parser.parseAST(commandList, tracker);
      boundaries.push($.getBoundaries(subresult.components));
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
  exports.parseCommand = function(argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections){
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
  };
}).call(this);
